const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all announcements (with filtering for students)
router.get('/', (req, res) => {
  const { studentId } = req.query;
  
  let sql;
  let params = [];
  
  if (studentId) {
    // For students - get announcements targeted to them or to all
    sql = `
      SELECT DISTINCT 
        a.*,
        CASE 
          WHEN a.target_type = 'all' THEN 'all'
          ELSE 'you'
        END as target_display,
        (SELECT is_read FROM announcement_recipients 
         WHERE announcement_id = a.id AND student_id = ?) as is_read
      FROM announcements a 
      WHERE a.target_type = 'all' 
         OR (a.target_type = 'specific' 
             AND EXISTS (
               SELECT 1 
               FROM announcement_recipients ar 
               WHERE ar.announcement_id = a.id 
               AND ar.student_id = ?
             ))
      ORDER BY a.created_at DESC
    `;
    params = [studentId, studentId];
  } else {
    // For admins - get all announcements with recipient count
    sql = `
      SELECT a.*, COUNT(ar.id) as recipient_count 
      FROM announcements a 
      LEFT JOIN announcement_recipients ar ON a.id = ar.announcement_id
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `;
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching announcements:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ announcements: results });
  });
});

// Create new announcement
router.post('/', (req, res) => {
  const {
    title,
    message,
    sender_id,
    sender_name,
    target_type,
    priority,
    selected_students
  } = req.body;

  // Validate target_type and selected_students
  if (target_type === 'specific' && (!selected_students || selected_students.length === 0)) {
    return res.status(400).json({ message: 'Selected students are required for specific targeting' });
  }

  const announcement = {
    title,
    message,
    sender_id,
    sender_name,
    target_type,
    priority: priority || 'medium'
  };

  db.query('INSERT INTO announcements SET ?', announcement, (err, result) => {
    if (err) {
      console.error('Error creating announcement:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    const announcementId = result.insertId;

    // If specific students are targeted, add them to recipients
    if (target_type === 'specific') {
      const recipientValues = selected_students.map(studentId => [announcementId, studentId]);
      
      db.query(
        'INSERT INTO announcement_recipients (announcement_id, student_id) VALUES ?',
        [recipientValues],
        (err) => {
          if (err) {
            console.error('Error adding recipients:', err);
            // If adding recipients fails, delete the announcement
            db.query('DELETE FROM announcements WHERE id = ?', [announcementId]);
            return res.status(500).json({ message: 'Error adding recipients' });
          }
          res.status(201).json({ 
            message: 'Announcement created successfully',
            announcementId
          });
        }
      );
    } else {
      res.status(201).json({ 
        message: 'Announcement created successfully',
        announcementId
      });
    }
  });
});

// Update announcement
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const {
    title,
    message,
    priority,
    target_type,
    selected_students
  } = req.body;

  const announcement = {
    title,
    message,
    priority,
    target_type
  };

  db.query('UPDATE announcements SET ? WHERE id = ?', [announcement, id], (err) => {
    if (err) {
      console.error('Error updating announcement:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (target_type === 'specific') {
      // First delete existing recipients
      db.query('DELETE FROM announcement_recipients WHERE announcement_id = ?', [id], (err) => {
        if (err) {
          console.error('Error removing old recipients:', err);
          return res.status(500).json({ message: 'Error updating recipients' });
        }

        // Then add new recipients if any
        if (selected_students && selected_students.length > 0) {
          const recipientValues = selected_students.map(studentId => [id, studentId]);
          
          db.query(
            'INSERT INTO announcement_recipients (announcement_id, student_id) VALUES ?',
            [recipientValues],
            (err) => {
              if (err) {
                console.error('Error adding new recipients:', err);
                return res.status(500).json({ message: 'Error updating recipients' });
              }
              res.json({ message: 'Announcement updated successfully' });
            }
          );
        } else {
          res.json({ message: 'Announcement updated successfully' });
        }
      });
    } else {
      // If target_type is 'all', just remove all recipients
      db.query('DELETE FROM announcement_recipients WHERE announcement_id = ?', [id], (err) => {
        if (err) {
          console.error('Error removing recipients:', err);
          return res.status(500).json({ message: 'Error updating announcement' });
        }
        res.json({ message: 'Announcement updated successfully' });
      });
    }
  });
});

// Delete announcement
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // The recipients will be automatically deleted due to ON DELETE CASCADE
  db.query('DELETE FROM announcements WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('Error deleting announcement:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ message: 'Announcement deleted successfully' });
  });
});

// Mark announcement as read for a student
router.post('/:id/read', (req, res) => {
  const { id } = req.params;
  const { studentId } = req.body;

  const sql = `
    INSERT INTO announcement_recipients (announcement_id, student_id, is_read, read_at)
    VALUES (?, ?, true, CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE is_read = true, read_at = CURRENT_TIMESTAMP
  `;

  db.query(sql, [id, studentId], (err) => {
    if (err) {
      console.error('Error marking announcement as read:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ message: 'Announcement marked as read' });
  });
});

module.exports = router;