const express = require("express");
const router = express.Router();
const db = require("../db");

// Get student courses by admission number
router.get("/courses/:admissionNumber", (req, res) => {
  const { admissionNumber } = req.params;

  const sql = `
    SELECT c.* 
    FROM courses c 
    INNER JOIN student_courses sc ON c.course_id = sc.course_id 
    WHERE sc.admission_number = ?
  `;
  
  db.query(sql, [admissionNumber], (err, result) => {
    if (err) {
      console.error("Error fetching student courses:", err);
      return res.status(500).json({ message: "Database error" });
    }
    
    res.status(200).json({ courses: result });
  });
});

// Get all students endpoint
router.get("/all", (req, res) => {
  const sql = "SELECT * FROM users WHERE role = 'student' ORDER BY name";
  
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching all students:", err);
      return res.status(500).json({ message: "Database error" });
    }
    
    res.status(200).json({ students: result });
  });
});

// Debug endpoint to check all users in database
router.get("/debug/users", (req, res) => {
  // Check admins
  const adminSql = "SELECT uid, name, email FROM admins";
  db.query(adminSql, (err, adminResult) => {
    if (err) {
      console.error("Error fetching admins:", err);
      return res.status(500).json({ message: "Database error" });
    }

    // Check students
    const studentSql = "SELECT uid, name, email, role FROM users";
    db.query(studentSql, (err, studentResult) => {
      if (err) {
        console.error("Error fetching students:", err);
        return res.status(500).json({ message: "Database error" });
      }

      res.status(200).json({
        admins: adminResult,
        students: studentResult,
        totalAdmins: adminResult.length,
        totalStudents: studentResult.length
      });
    });
  });
});

// Check user role endpoint
router.get("/check-role/:uid", (req, res) => {
  const { uid } = req.params;
  console.log('Checking role for UID:', uid);

  // First check if user is admin
  const adminSql = "SELECT * FROM admins WHERE uid = ?";
  db.query(adminSql, [uid], (err, adminResult) => {
    if (err) {
      console.error("Error checking admin:", err);
      return res.status(500).json({ message: "Database error" });
    }

    console.log('Admin check result:', adminResult);

    if (adminResult.length > 0) {
      return res.status(200).json({ role: "admin", user: adminResult[0] });
    }

    // If not admin, check if student
    const studentSql = "SELECT * FROM users WHERE uid = ?";
    db.query(studentSql, [uid], (err, studentResult) => {
      if (err) {
        console.error("Error checking student:", err);
        return res.status(500).json({ message: "Database error" });
      }

      console.log('Student check result:', studentResult);

      if (studentResult.length > 0) {
        return res.status(200).json({ role: "student", user: studentResult[0] });
      }

      // User not found in either table
      return res.status(404).json({ message: "User not found" });
    });
  });
});

router.get("/profile/:uid", (req, res) => {
  const { uid } = req.params;

  const studentSql = "SELECT * FROM users WHERE uid = ?";
  db.query(studentSql, [uid], (err, studentResult) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (studentResult.length === 0) return res.status(404).json({ message: "Student not found" });
    
    const student = studentResult[0];

    // Get student courses with class details
    const coursesSql = `
      SELECT sc.course_id, sc.class_id, c.course_name, c.amount, cc.class_name
      FROM student_courses sc
      INNER JOIN courses c ON sc.course_id = c.course_id
      LEFT JOIN course_classes cc ON sc.class_id = cc.class_id
      WHERE sc.admission_number = ?
    `;
    db.query(coursesSql, [student.admission_number], (err, coursesResult) => {
      if (err) return res.status(500).json({ message: "Database error" });

      // Get payment history for the student
      const paymentsSql = `
        SELECT p.*, c.course_name
        FROM payments p
        INNER JOIN courses c ON p.course_id = c.course_id
        WHERE p.admission_number = ?
        ORDER BY p.payment_date DESC
      `;
      db.query(paymentsSql, [student.admission_number], (err, paymentsResult) => {
        if (err) return res.status(500).json({ message: "Database error" });

        // Also get all available classes for each course
        const courseIds = coursesResult.map(c => c.course_id);
        if (courseIds.length === 0) {
          return res.json({ 
            student, 
            courses: [], 
            payments: paymentsResult || []
          });
        }

        const availableClassesSql = `
          SELECT * FROM course_classes
          WHERE course_id IN (?)
        `;
        db.query(availableClassesSql, [courseIds], (err, classesResult) => {
          if (err) return res.status(500).json({ message: "Database error" });

          // Attach availableClasses to each student course
          const courses = coursesResult.map(course => ({
            ...course,
            availableClasses: classesResult.filter(cls => cls.course_id === course.course_id)
          }));

          res.json({ 
            student, 
            courses, 
            payments: paymentsResult || []
          });
        });
      });
    });
  });
});

//register a new student

router.post("/register", (req, res) => {
  const {
    uid,
    admission_number,
    batch,
    name,
    residential_tel,
    whatsapp_number,
    gender,
    nic_number,
    email,
    address,
    school,
  } = req.body;

  const sql = `
    INSERT INTO users (uid, role, admission_number, batch, name, residential_tel, whatsapp_number, gender, nic_number, email, address, school)
    VALUES (?, 'student', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [uid, admission_number, batch, name, residential_tel, whatsapp_number, gender, nic_number, email, address, school],
    (err, result) => {
      if (err) {
        console.error("Error inserting student:", err);
        return res.status(500).json({ message: "Database error" });
      }
      res.status(200).json({ message: "Student registered successfully" });
    }
  );
});

// Update student details
router.put("/update/:uid", (req, res) => {
  const { uid } = req.params;
  const {
    admission_number,
    batch,
    name,
    residential_tel,
    whatsapp_number,
    gender,
    nic_number,
    email,
    address,
    school,
  } = req.body;

  const sql = `
    UPDATE users 
    SET admission_number = ?, batch = ?, name = ?, residential_tel = ?, 
        whatsapp_number = ?, gender = ?, nic_number = ?, email = ?, 
        address = ?, school = ?
    WHERE uid = ?
  `;

  db.query(
    sql,
    [
      admission_number,
      batch,
      name,
      residential_tel,
      whatsapp_number,
      gender,
      nic_number,
      email,
      address,
      school,
      uid,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating student:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.status(200).json({ message: "Student updated successfully" });
    }
  );
});

// Update or add special note
router.put("/:uid/note", (req, res) => {
  const { uid } = req.params;
  const { special_note } = req.body;

  const sql = "UPDATE users SET special_note = ? WHERE uid = ?";

  db.query(sql, [special_note, uid], (err, result) => {
    if (err) {
      console.error("Error updating note:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ success: true, message: "Note saved successfully" });
  });
});

// GET /api/students/with-notes
router.get('/with-notes', (req, res) => {
  const sql = `
    SELECT uid, name, admission_number, email, batch, whatsapp_number, special_note
    FROM users
    WHERE special_note IS NOT NULL AND special_note != ''
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching students with notes:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    res.json({ students: results });
  });
});

// 1. Student submits update request
router.post("/request-update/:uid", (req, res) => {
  const { uid } = req.params;

  // Only allow specific fields
  const allowedFields = ["admission_number", "residential_tel", "whatsapp_number", "address"];
  const requestedData = req.body;
  const filteredData = {};

  for (const key of Object.keys(requestedData)) {
    if (allowedFields.includes(key)) filteredData[key] = requestedData[key];
  }

  if (Object.keys(filteredData).length === 0) {
    return res.status(400).json({ message: "No valid fields to request update" });
  }

  const sql = "INSERT INTO student_update_requests (student_uid, requested_data) VALUES (?, ?)";
  db.query(sql, [uid, JSON.stringify(filteredData)], (err, result) => {
    if (err) {
      console.error("Error creating update request:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(201).json({ message: "Update request submitted successfully" });
  });
});

// 2. Admin fetches all requests
router.get("/requests", (req, res) => {
  const sql = `
    SELECT r.id, r.student_uid, r.requested_data, r.status, r.created_at,
           u.name, u.email, u.admission_number
    FROM student_update_requests r
    JOIN users u ON r.student_uid = u.uid
    ORDER BY r.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching requests:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json({ requests: results });
  });
});

// Admin approves request
router.put("/requests/:id/approve", (req, res) => {
  const { id } = req.params;

  const sqlGet = "SELECT * FROM student_update_requests WHERE id = ?";
  db.query(sqlGet, [id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(404).json({ message: "Request not found" });

    const request = results[0];
    const requestedData = JSON.parse(request.requested_data);

    // Only allow WhatsApp, Residential number, and Address updates
    const allowedFields = ["residential_tel", "whatsapp_number", "address"];
    const validData = {};
    for (const key of Object.keys(requestedData)) {
      if (allowedFields.includes(key) && requestedData[key].trim() !== "") {
        validData[key] = requestedData[key];
      }
    }

    if (Object.keys(validData).length === 0)
      return res.status(400).json({ message: "No valid fields to update" });

    const fields = Object.keys(validData).map(key => `${key} = ?`).join(", ");
    const values = Object.values(validData);
    const sqlUpdate = `UPDATE users SET ${fields} WHERE uid = ?`;

    db.query(sqlUpdate, [...values, request.student_uid], (err2) => {
      if (err2) return res.status(500).json({ message: "Failed to apply update" });

      db.query("UPDATE student_update_requests SET status = 'approved' WHERE id = ?", [id], (err3) => {
        if (err3) return res.status(500).json({ message: "Failed to update request status" });
        res.json({ message: "Request approved and student updated" });
      });
    });
  });
});



// 4. Admin rejects request
router.put("/requests/:id/reject", (req, res) => {
  const { id } = req.params;
  db.query("UPDATE student_update_requests SET status = 'rejected' WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Error rejecting request:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json({ message: "Request rejected" });
  });
});


router.put("/classes/:uid/:course_id", (req, res) => {
  const { uid, course_id } = req.params;
  const { class_id } = req.body; // can be null for "no class"

  // Get student admission number
  db.query("SELECT admission_number FROM users WHERE uid = ?", [uid], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.length === 0) return res.status(404).json({ message: "Student not found" });

    const admission_number = result[0].admission_number;

    // Update class in student_courses
    db.query(
      "UPDATE student_courses SET class_id = ? WHERE admission_number = ? AND course_id = ?",
      [class_id, admission_number, course_id],
      (err2) => {
        if (err2) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Class updated successfully" });
      }
    );
  });
});


module.exports = router;
