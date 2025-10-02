const express = require('express');
const db = require('../db');
const admin = require('../firebase/admin');
const router = express.Router();

// Middleware to verify Firebase token
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// Middleware to verify admin role
const requireAdmin = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    
    // Check if user is admin
    const adminSql = "SELECT * FROM admins WHERE uid = ?";
    db.query(adminSql, [uid], (err, adminResult) => {
      if (err) {
        console.error("Error checking admin:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (adminResult.length > 0) {
        req.userRole = 'admin';
        req.userId = uid;
        req.username = adminResult[0].name || adminResult[0].email;
        next();
      } else {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }
    });
  } catch (error) {
    console.error('Admin verification error:', error);
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }
};

// ==================== ADMIN ROUTES ====================

// Create new announcement
router.post("/", authenticateUser, requireAdmin, (req, res) => {
  const { title, message, targetType, priority, studentIds } = req.body;
  const senderId = req.userId;
  const senderName = req.username;

  if (!title || !message) {
    return res.status(400).json({ error: "Title and message are required" });
  }

  const sql = `INSERT INTO announcements (title, message, sender_id, sender_name, target_type, priority) 
               VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.query(sql, [title, message, senderId, senderName, targetType || "all", priority || "medium"], (err, result) => {
    if (err) {
      console.error("Error creating announcement:", err);
      return res.status(500).json({ error: "Failed to create announcement" });
    }

    const announcementId = result.insertId;

    // If specific students, insert recipients
    if (targetType === "specific" && studentIds && studentIds.length > 0) {
      const recipientValues = studentIds.map(studentId => [announcementId, studentId]);
      const recipientSql = `INSERT INTO announcement_recipients (announcement_id, student_id) VALUES ?`;
      
      db.query(recipientSql, [recipientValues], (err2) => {
        if (err2) {
          console.error("Error adding recipients:", err2);
          return res.status(500).json({ error: "Failed to add recipients" });
        }
        res.status(201).json({
          success: true,
          message: "Announcement created successfully",
          announcementId
        });
      });
    } else {
      res.status(201).json({
        success: true,
        message: "Announcement created successfully",
        announcementId
      });
    }
  });
});

// Get all announcements (admin view)
router.get("/admin/all", authenticateUser, requireAdmin, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const sql = `SELECT 
    a.*,
    COUNT(DISTINCT ar.id) as recipient_count,
    COUNT(DISTINCT CASE WHEN ar.is_read = TRUE THEN ar.id END) as read_count
  FROM announcements a
  LEFT JOIN announcement_recipients ar ON a.id = ar.announcement_id
  GROUP BY a.id
  ORDER BY a.created_at DESC
  LIMIT ? OFFSET ?`;

  db.query(sql, [limit, offset], (err, announcements) => {
    if (err) {
      console.error("Error fetching announcements:", err);
      return res.status(500).json({ error: "Failed to fetch announcements" });
    }

    const countSql = `SELECT COUNT(*) as total FROM announcements`;
    db.query(countSql, (err2, countResult) => {
      if (err2) {
        console.error("Error counting announcements:", err2);
        return res.status(500).json({ error: "Failed to count announcements" });
      }

      const total = countResult[0].total;
      res.json({
        success: true,
        announcements,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    });
  });
});

// Get announcement details with recipients
router.get("/admin/:id", authenticateUser, requireAdmin, (req, res) => {
  const { id } = req.params;

  const sql = `SELECT * FROM announcements WHERE id = ?`;
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching announcement:", err);
      return res.status(500).json({ error: "Failed to fetch announcement" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    const announcement = results[0];

    if (announcement.target_type === "specific") {
      const recipientSql = `SELECT 
        ar.*,
        u.username,
        u.email,
        u.first_name,
        u.last_name
      FROM announcement_recipients ar
      JOIN users u ON ar.student_id = u.id
      WHERE ar.announcement_id = ?`;

      db.query(recipientSql, [id], (err2, recipients) => {
        if (err2) {
          console.error("Error fetching recipients:", err2);
          return res.status(500).json({ error: "Failed to fetch recipients" });
        }
        announcement.recipients = recipients;
        res.json({ success: true, announcement });
      });
    } else {
      res.json({ success: true, announcement });
    }
  });
});

// Update announcement
router.put("/:id", authenticateUser, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { title, message, priority } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: "Title and message are required" });
  }

  const sql = `UPDATE announcements 
               SET title = ?, message = ?, priority = ?
               WHERE id = ?`;

  db.query(sql, [title, message, priority || "medium", id], (err, result) => {
    if (err) {
      console.error("Error updating announcement:", err);
      return res.status(500).json({ error: "Failed to update announcement" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    res.json({
      success: true,
      message: "Announcement updated successfully"
    });
  });
});

// Delete announcement
router.delete("/:id", authenticateUser, requireAdmin, (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM announcements WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting announcement:", err);
      return res.status(500).json({ error: "Failed to delete announcement" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    res.json({
      success: true,
      message: "Announcement deleted successfully"
    });
  });
});

// Get all students
// Remove middleware temporarily to test
router.get("/admin/students/list", /* authenticateUser, requireAdmin, */ (req, res) => {
  const sql = `SELECT id, username, email, first_name, last_name, created_at
               FROM users 
               WHERE role = 'student'
               ORDER BY first_name, last_name`;

  db.query(sql, (err, students) => {
    if (err) {
      console.error("Error fetching students:", err);
      return res.status(500).json({ error: "Failed to fetch students", details: err.message });
    }

    res.json({ success: true, students });
  });
});

// ==================== STUDENT ROUTES ====================

// Middleware to verify student role
const requireStudent = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    
    // Check if user is student
    const studentSql = "SELECT * FROM users WHERE uid = ?";
    db.query(studentSql, [uid], (err, studentResult) => {
      if (err) {
        console.error("Error checking student:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (studentResult.length > 0) {
        req.userRole = 'student';
        req.userId = uid;
        req.username = studentResult[0].name || studentResult[0].email;
        next();
      } else {
        return res.status(403).json({ error: "Forbidden: Student access required" });
      }
    });
  } catch (error) {
    console.error('Student verification error:', error);
    return res.status(403).json({ error: "Forbidden: Student access required" });
  }
};

// Get announcements for logged-in student
router.get("/student/my-announcements", authenticateUser, requireStudent, (req, res) => {
  const studentId = req.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const sql = `SELECT 
    a.*,
    COALESCE(ar.is_read, FALSE) as is_read,
    ar.read_at
  FROM announcements a
  LEFT JOIN announcement_recipients ar ON a.id = ar.announcement_id AND ar.student_id = ?
  WHERE a.target_type = 'all' 
     OR (a.target_type = 'specific' AND ar.student_id = ?)
  ORDER BY a.priority DESC, a.created_at DESC
  LIMIT ? OFFSET ?`;

  db.query(sql, [studentId, studentId, limit, offset], (err, announcements) => {
    if (err) {
      console.error("Error fetching student announcements:", err);
      return res.status(500).json({ error: "Failed to fetch announcements" });
    }

    const countSql = `SELECT COUNT(DISTINCT a.id) as total
    FROM announcements a
    LEFT JOIN announcement_recipients ar ON a.id = ar.announcement_id AND ar.student_id = ?
    WHERE a.target_type = 'all' 
       OR (a.target_type = 'specific' AND ar.student_id = ?)`;

    db.query(countSql, [studentId, studentId], (err2, countResult) => {
      if (err2) {
        console.error("Error counting announcements:", err2);
        return res.status(500).json({ error: "Failed to count announcements" });
      }

      const unreadSql = `SELECT COUNT(DISTINCT a.id) as unreadCount
      FROM announcements a
      LEFT JOIN announcement_recipients ar ON a.id = ar.announcement_id AND ar.student_id = ?
      WHERE (a.target_type = 'all' OR (a.target_type = 'specific' AND ar.student_id = ?))
        AND (ar.is_read IS NULL OR ar.is_read = FALSE)`;

      db.query(unreadSql, [studentId, studentId], (err3, unreadResult) => {
        if (err3) {
          console.error("Error counting unread:", err3);
          return res.status(500).json({ error: "Failed to count unread" });
        }

        const total = countResult[0].total;
        const unreadCount = unreadResult[0].unreadCount;

        res.json({
          success: true,
          announcements,
          unreadCount,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        });
      });
    });
  });
});

// Mark announcement as read
router.put("/student/:id/read", authenticateUser, requireStudent, (req, res) => {
  const { id } = req.params;
  const studentId = req.userId;

  const checkSql = `SELECT * FROM announcements WHERE id = ?`;
  db.query(checkSql, [id], (err, results) => {
    if (err) {
      console.error("Error checking announcement:", err);
      return res.status(500).json({ error: "Failed to check announcement" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    const announcement = results[0];

    const updateSql = `INSERT INTO announcement_recipients (announcement_id, student_id, is_read, read_at)
                       VALUES (?, ?, TRUE, NOW())
                       ON DUPLICATE KEY UPDATE is_read = TRUE, read_at = NOW()`;

    db.query(updateSql, [id, studentId], (err2) => {
      if (err2) {
        console.error("Error marking as read:", err2);
        return res.status(500).json({ error: "Failed to mark announcement as read" });
      }

      res.json({
        success: true,
        message: "Announcement marked as read"
      });
    });
  });
});

// Get single announcement details (student view)
router.get("/student/:id", authenticateUser, requireStudent, (req, res) => {
  const { id } = req.params;
  const studentId = req.userId;

  const sql = `SELECT 
    a.*,
    COALESCE(ar.is_read, FALSE) as is_read,
    ar.read_at
  FROM announcements a
  LEFT JOIN announcement_recipients ar ON a.id = ar.announcement_id AND ar.student_id = ?
  WHERE a.id = ? AND (a.target_type = 'all' OR (a.target_type = 'specific' AND ar.student_id = ?))`;

  db.query(sql, [studentId, id, studentId], (err, results) => {
    if (err) {
      console.error("Error fetching announcement:", err);
      return res.status(500).json({ error: "Failed to fetch announcement" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    res.json({
      success: true,
      announcement: results[0]
    });
  });
});


module.exports = router;