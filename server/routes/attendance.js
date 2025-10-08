const express = require('express');
const router = express.Router();
const db = require('../db');

// ==================== COURSE STRUCTURE ROUTES ====================

// Create course structure
router.post('/course-structure', (req, res) => {
  const { course_id, total_sessions, minimum_attendance_percentage, description } = req.body;

  const sql = `
    INSERT INTO course_structure (course_id, total_sessions, minimum_attendance_percentage, description)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [course_id, total_sessions, minimum_attendance_percentage || 80, description], (err, result) => {
    if (err) {
      console.error('Error creating course structure:', err);
      return res.status(500).json({ error: 'Failed to create course structure' });
    }
    res.status(201).json({ 
      message: 'Course structure created successfully',
      structure_id: result.insertId
    });
  });
});

// Get all course structures
router.get('/course-structures', (req, res) => {
  const sql = `
    SELECT cs.*, c.course_name
    FROM course_structure cs
    INNER JOIN courses c ON cs.course_id = c.course_id
    ORDER BY c.course_name
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching course structures:', err);
      return res.status(500).json({ error: 'Failed to fetch course structures' });
    }
    res.json(results);
  });
});

// Update course structure
router.put('/course-structure/:id', (req, res) => {
  const { id } = req.params;
  const { total_sessions, minimum_attendance_percentage, description } = req.body;

  const sql = `
    UPDATE course_structure 
    SET total_sessions = ?, minimum_attendance_percentage = ?, description = ?
    WHERE structure_id = ?
  `;

  db.query(sql, [total_sessions, minimum_attendance_percentage, description, id], (err) => {
    if (err) {
      console.error('Error updating course structure:', err);
      return res.status(500).json({ error: 'Failed to update course structure' });
    }
    res.json({ message: 'Course structure updated successfully' });
  });
});

// ==================== BATCH COURSES ROUTES ====================

// Create batch course (assign course to a batch)
router.post('/batch-course', (req, res) => {
  const { batch, course_id, class_id, structure_id, start_date, end_date } = req.body;

  const sql = `
    INSERT INTO batch_courses (batch, course_id, class_id, structure_id, start_date, end_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [batch, course_id, class_id || null, structure_id, start_date, end_date || null], (err, result) => {
    if (err) {
      console.error('Error creating batch course:', err);
      return res.status(500).json({ error: 'Failed to create batch course' });
    }
    res.status(201).json({ 
      message: 'Batch course created successfully',
      batch_course_id: result.insertId
    });
  });
});

// Get all batch courses
router.get('/batch-courses', (req, res) => {
  const { batch, is_active } = req.query;

  let sql = `
    SELECT 
      bc.*,
      c.course_name,
      cc.class_name,
      cs.total_sessions,
      cs.minimum_attendance_percentage,
      COUNT(DISTINCT s.session_id) as created_sessions
    FROM batch_courses bc
    INNER JOIN courses c ON bc.course_id = c.course_id
    LEFT JOIN course_classes cc ON bc.class_id = cc.class_id
    INNER JOIN course_structure cs ON bc.structure_id = cs.structure_id
    LEFT JOIN sessions s ON s.batch_course_id = bc.batch_course_id
  `;

  const conditions = [];
  const params = [];

  if (batch) {
    conditions.push('bc.batch = ?');
    params.push(batch);
  }

  if (is_active !== undefined) {
    conditions.push('bc.is_active = ?');
    params.push(is_active === 'true' ? 1 : 0);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' GROUP BY bc.batch_course_id ORDER BY bc.start_date DESC';

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching batch courses:', err);
      return res.status(500).json({ error: 'Failed to fetch batch courses' });
    }
    res.json(results);
  });
});

// Get batch course details
router.get('/batch-course/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      bc.*,
      c.course_name,
      cc.class_name,
      cs.total_sessions,
      cs.minimum_attendance_percentage,
      cs.description
    FROM batch_courses bc
    INNER JOIN courses c ON bc.course_id = c.course_id
    LEFT JOIN course_classes cc ON bc.class_id = cc.class_id
    INNER JOIN course_structure cs ON bc.structure_id = cs.structure_id
    WHERE bc.batch_course_id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error fetching batch course:', err);
      return res.status(500).json({ error: 'Failed to fetch batch course' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Batch course not found' });
    }
    res.json(results[0]);
  });
});

// Deactivate batch course
router.put('/batch-course/:id/deactivate', (req, res) => {
  const { id } = req.params;

  const sql = 'UPDATE batch_courses SET is_active = FALSE WHERE batch_course_id = ?';

  db.query(sql, [id], (err) => {
    if (err) {
      console.error('Error deactivating batch course:', err);
      return res.status(500).json({ error: 'Failed to deactivate batch course' });
    }
    res.json({ message: 'Batch course deactivated successfully' });
  });
});

// ==================== SESSION ROUTES ====================

// Create session (linked to batch course)
router.post('/session', (req, res) => {
  const { batch_course_id, date, topic, session_number, session_type, is_mandatory } = req.body;

  if (!batch_course_id || !date) {
    return res.status(400).json({ error: 'Batch course ID and date are required' });
  }

  const sql = `
    INSERT INTO sessions (batch_course_id, date, topic, session_number, session_type, is_mandatory)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [
    batch_course_id,
    date,
    topic || null,
    session_number || null,
    session_type || 'regular',
    is_mandatory !== undefined ? is_mandatory : true
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error creating session:', err);
      return res.status(500).json({ error: 'Failed to create session' });
    }

    // Fetch the created session with details
    const selectSql = `
      SELECT 
        s.*,
        bc.batch,
        bc.course_id,
        bc.class_id,
        c.course_name,
        cc.class_name,
        cs.total_sessions
      FROM sessions s
      INNER JOIN batch_courses bc ON s.batch_course_id = bc.batch_course_id
      INNER JOIN courses c ON bc.course_id = c.course_id
      LEFT JOIN course_classes cc ON bc.class_id = cc.class_id
      INNER JOIN course_structure cs ON bc.structure_id = cs.structure_id
      WHERE s.session_id = ?
    `;

    db.query(selectSql, [result.insertId], (err2, session) => {
      if (err2) {
        console.error('Error fetching created session:', err2);
        return res.status(500).json({ error: 'Failed to fetch created session' });
      }
      res.status(201).json(session[0]);
    });
  });
});

// Get sessions
router.get('/sessions', (req, res) => {
  const { batch_course_id, session_type, batch } = req.query;

  let sql = `
    SELECT 
      s.*,
      bc.batch,
      bc.course_id,
      bc.class_id,
      c.course_name,
      cc.class_name,
      cs.total_sessions,
      COUNT(DISTINCT a.attendance_id) as attendance_count,
      COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.attendance_id END) as present_count
    FROM sessions s
    INNER JOIN batch_courses bc ON s.batch_course_id = bc.batch_course_id
    INNER JOIN courses c ON bc.course_id = c.course_id
    LEFT JOIN course_classes cc ON bc.class_id = cc.class_id
    INNER JOIN course_structure cs ON bc.structure_id = cs.structure_id
    LEFT JOIN attendance a ON s.session_id = a.session_id
  `;

  const conditions = [];
  const params = [];

  if (batch_course_id) {
    conditions.push('s.batch_course_id = ?');
    params.push(batch_course_id);
  }

  if (session_type) {
    conditions.push('s.session_type = ?');
    params.push(session_type);
  }

  if (batch) {
    conditions.push('bc.batch = ?');
    params.push(batch);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' GROUP BY s.session_id ORDER BY s.date DESC';

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching sessions:', err);
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }
    res.json(results);
  });
});

// Get students for a session
router.get('/session/:sessionId/students', (req, res) => {
  const { sessionId } = req.params;

  // Get session details
  const sessionSql = `
    SELECT s.*, bc.batch, bc.course_id, bc.class_id
    FROM sessions s
    INNER JOIN batch_courses bc ON s.batch_course_id = bc.batch_course_id
    WHERE s.session_id = ?
  `;

  db.query(sessionSql, [sessionId], (err, sessionResults) => {
    if (err) {
      console.error('Error fetching session:', err);
      return res.status(500).json({ error: 'Failed to fetch session' });
    }

    if (sessionResults.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = sessionResults[0];

    // Get students enrolled in this batch course
    let studentsSql = `
      SELECT 
        u.id,
        u.uid,
        u.admission_number,
        u.name,
        u.batch,
        COALESCE(a.status, 'absent') AS status
      FROM users u
      INNER JOIN student_courses sc ON u.admission_number = sc.admission_number
      LEFT JOIN attendance a ON a.session_id = ? AND a.student_id = u.id
      WHERE u.batch = ? AND sc.course_id = ?
    `;

    const params = [sessionId, session.batch, session.course_id];

    if (session.class_id) {
      studentsSql += ' AND sc.class_id = ?';
      params.push(session.class_id);
    }

    studentsSql += ' ORDER BY u.name';

    db.query(studentsSql, params, (err2, students) => {
      if (err2) {
        console.error('Error fetching students:', err2);
        return res.status(500).json({ error: 'Failed to fetch students' });
      }

      // Remove duplicates
      const uniqueStudents = students.reduce((acc, curr) => {
        if (!acc.some(s => s.id === curr.id)) acc.push(curr);
        return acc;
      }, []);

      res.json(uniqueStudents);
    });
  });
});

// Mark attendance
router.post('/session/:id/attendance', (req, res) => {
  const { id } = req.params;
  const { attendance } = req.body;

  if (!Array.isArray(attendance)) {
    return res.status(400).json({ error: 'Invalid attendance data' });
  }

  const queries = attendance.map(a => {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO attendance (session_id, student_id, status)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE status = VALUES(status)
      `;
      db.query(sql, [id, a.student_id, a.status], err => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  Promise.all(queries)
    .then(() => res.json({ message: 'Attendance updated successfully' }))
    .catch(err => {
      console.error('Error updating attendance:', err);
      res.status(500).json({ error: 'Failed to update attendance' });
    });
});

// ==================== ATTENDANCE SUMMARY ROUTES ====================

// Get student attendance summary
router.get('/student-attendance/:studentId', (req, res) => {
  const { studentId } = req.params;

  const sql = `
    SELECT * FROM student_attendance_summary
    WHERE student_id = ?
    ORDER BY course_name, class_name
  `;

  db.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error('Error fetching student attendance:', err);
      return res.status(500).json({ error: 'Failed to fetch attendance summary' });
    }
    res.json(results);
  });
});

// Get attendance summary by batch course
router.get('/attendance-summary/:batchCourseId', (req, res) => {
  const { batchCourseId } = req.params;

  const sql = `
    SELECT * FROM student_attendance_summary
    WHERE batch_course_id = ?
    ORDER BY student_name
  `;

  db.query(sql, [batchCourseId], (err, results) => {
    if (err) {
      console.error('Error fetching attendance summary:', err);
      return res.status(500).json({ error: 'Failed to fetch attendance summary' });
    }
    res.json(results);
  });
});

// Get students needing supporting sessions
router.get('/students-needing-support/:batchCourseId', (req, res) => {
  const { batchCourseId } = req.params;

  const sql = `
    SELECT * FROM student_attendance_summary
    WHERE batch_course_id = ?
    AND regular_attendance_percentage < minimum_attendance_percentage
    AND exam_eligibility = 'not_eligible'
    ORDER BY regular_attendance_percentage ASC
  `;

  db.query(sql, [batchCourseId], (err, results) => {
    if (err) {
      console.error('Error fetching students needing support:', err);
      return res.status(500).json({ error: 'Failed to fetch students' });
    }
    res.json(results);
  });
});

// ==================== UTILITY ROUTES ====================

// Get all batches
router.get('/batches', (req, res) => {
  const sql = 'SELECT DISTINCT batch FROM users ORDER BY batch';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching batches:', err);
      return res.status(500).json({ error: 'Failed to fetch batches' });
    }
    const batches = results.map(r => r.batch);
    res.json(batches);
  });
});

// Get courses
router.get('/courses', (req, res) => {
  const sql = 'SELECT * FROM courses ORDER BY course_name';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching courses:', err);
      return res.status(500).json({ error: 'Failed to fetch courses' });
    }
    res.json(results);
  });
});

// Get classes for a course
router.get('/courses/:courseId/classes', (req, res) => {
  const { courseId } = req.params;

  const sql = `
    SELECT * FROM course_classes
    WHERE course_id = ?
    ORDER BY class_name
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