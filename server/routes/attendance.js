const express = require('express');
const router = express.Router();
const db = require('../db');

// ------------------- CREATE SESSION -------------------
// In your session creation endpoint
router.post('/session', (req, res) => {
  const { batch, course_id, class_id, date, topic } = req.body;

  if (!batch || !course_id || !date) {
    return res.status(400).json({ error: 'Batch, course and date are required' });
  }

  // Validate class exists for this course if provided
  if (class_id) {
    const classCheck = 'SELECT * FROM student_courses WHERE course_id = ? AND class_id = ? LIMIT 1';
    db.query(classCheck, [course_id, class_id], (err, classResults) => {
      if (err || classResults.length === 0) {
        return res.status(400).json({ error: 'Invalid class for this course' });
      }
      
      proceedWithSessionCreation();
    });
  } else {
    proceedWithSessionCreation();
  }

  function proceedWithSessionCreation() {
    const sqlInsert = `
      INSERT INTO sessions (batch, course_id, class_id, date, topic)
      VALUES (?, ?, ?, ?, ?)
    `;

    const topicValue = topic && topic.trim() !== '' ? topic : null;

    db.query(sqlInsert, [batch, course_id, class_id || null, date, topicValue], (err, result) => {
      if (err) {
        console.error("SQL ERROR on INSERT SESSION:", err);
        return res.status(500).json({ error: 'Failed to create session', details: err.message });
      }

      const sqlSelect = `
        SELECT s.session_id, s.batch, s.course_id, s.class_id, s.date, s.topic,
               c.course_name
        FROM sessions s
        LEFT JOIN courses c ON s.course_id = c.course_id
        WHERE s.session_id = ?
      `;

      db.query(sqlSelect, [result.insertId], (err2, session) => {
        if (err2) {
          console.error("SQL ERROR on SELECT NEW SESSION:", err2);
          return res.status(500).json({ error: 'Failed to fetch session', details: err2.message });
        }
        res.status(201).json(session[0]);
      });
    });
  }
});

// ------------------- LIST SESSIONS -------------------
// In your backend - Update the sessions listing route
// In your backend route (/api/attendance/sessions)
router.get('/sessions', (req, res) => {
  const sql = `
    SELECT 
  s.session_id, 
  s.batch, 
  s.course_id, 
  s.class_id, 
  s.date, 
  s.topic,
  c.course_name,
  sc.class AS student_class,
  cc.class_name
FROM sessions s
LEFT JOIN courses c 
  ON s.course_id = c.course_id
LEFT JOIN student_courses sc 
  ON s.course_id = sc.course_id AND s.class_id = sc.class_id
LEFT JOIN course_classes cc 
  ON s.class_id = cc.class_id
GROUP BY s.session_id
ORDER BY s.date DESC;
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("SQL Error in /sessions:", err);
      return res.status(500).json({ 
        error: 'Failed to load sessions',
        details: err.message 
      });
    }
    res.json(results);
  });
});




// Get students for a specific session  

router.get('/session/:sessionId/students', (req, res) => {
  const sessionId = req.params.sessionId;

  // First get session details to know the class_id and course_id
  const sessionQuery = 'SELECT class_id, course_id FROM sessions WHERE session_id = ?';
  
  db.query(sessionQuery, [sessionId], (err, sessionResults) => {
    if (err) {
      console.error('Error fetching session:', err);
      return res.status(500).json({ error: 'Failed to fetch session details' });
    }
    
    if (sessionResults.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const classId = sessionResults[0].class_id;
    const courseId = sessionResults[0].course_id;
    
    let query = `
      SELECT 
        u.id,
        u.uid,
        u.admission_number,
        u.name,
        u.batch,
        COALESCE(a.status, 'absent') AS status,
        sc.class,
        sc.class_id
      FROM users u
      JOIN student_courses sc ON u.admission_number = sc.admission_number
      JOIN sessions s ON s.session_id = ?
      LEFT JOIN attendance a ON a.session_id = ? AND a.student_id = u.id
      WHERE sc.course_id = ? AND s.course_id = ?
    `;
    
    const queryParams = [sessionId, sessionId, courseId, courseId];
    
    // Add class filter if class_id exists in session
    if (classId) {
      query += ` AND sc.class_id = ?`;
      queryParams.push(classId);
    }
    
    query += ` ORDER BY u.name`;
    
    db.query(query, queryParams, (err, rows) => {
      if (err) {
        console.error(`Error fetching students for session ${sessionId}:`, err);
        return res.status(500).json({
          error: 'Internal Server Error',
          details: err.message
        });
      }
      
      // Remove duplicates (in case students are enrolled multiple times)
      const uniqueStudents = rows.reduce((acc, curr) => {
        if (!acc.some(s => s.id === curr.id)) acc.push(curr);
        return acc;
      }, []);
      
      res.json(uniqueStudents);
    });
  });
});

// ------------------- MARK / UPDATE ATTENDANCE -------------------
router.post('/session/:id/attendance', (req, res) => {
  const sessionId = req.params.id;
  const { attendance } = req.body;
  if (!Array.isArray(attendance)) return res.status(400).json({ error: 'Invalid payload' });

  const queries = attendance.map(a => {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO attendance (session_id, student_id, status)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE status = VALUES(status)
      `;
      db.query(sql, [sessionId, a.student_id, a.status], err => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  Promise.all(queries)
    .then(() => res.json({ message: 'Attendance updated' }))
    .catch(err => res.status(500).json({ error: err.message }));
});


// ------------------- GET ALL BATCHES -------------------
router.get('/batches', (req, res) => {
  const sql = `SELECT DISTINCT batch FROM users ORDER BY batch`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const batches = results.map(r => r.batch);
    res.json(batches);
  });
});

// Get classes for a specific course
router.get('/courses/:courseId/classes', (req, res) => {
  const courseId = req.params.courseId;
  
  const sql = `
    SELECT DISTINCT class_id, class 
    FROM student_courses 
    WHERE course_id = ? 
    AND class_id IS NOT NULL 
    ORDER BY class
  `;
  
  db.query(sql, [courseId], (err, results) => {
    if (err) {
      console.error('Error fetching classes:', err);
      return res.status(500).json({ error: 'Failed to fetch classes' });
    }
    res.json(results);
  });
});

module.exports = router;
