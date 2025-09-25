const express = require('express');
const router = express.Router();
const db = require('../db');

// Check eligibility for all students in a course/class
router.get('/course/:courseId', (req, res) => {
  const { courseId } = req.params;
  const { classId } = req.query; // Optional class filter

  let query = `
    SELECT 
      u.id,
      u.uid,
      u.admission_number,
      u.name,
      u.batch,
      sc.class,
      sc.class_id,
      COUNT(s.session_id) as total_sessions,
      COUNT(CASE WHEN a.status = 'present' OR a.status = 'Present' THEN 1 END) as present_sessions,
      ROUND(
        (COUNT(CASE WHEN a.status = 'present' OR a.status = 'Present' THEN 1 END) * 100.0 / 
         COUNT(s.session_id)), 2
      ) as attendance_percentage,
      CASE 
        WHEN ROUND(
          (COUNT(CASE WHEN a.status = 'present' OR a.status = 'Present' THEN 1 END) * 100.0 / 
           COUNT(s.session_id)), 2
        ) >= 80 THEN 'eligible'
        ELSE 'not_eligible'
      END as exam_eligibility
    FROM users u
    JOIN student_courses sc ON u.admission_number = sc.admission_number
    JOIN sessions s ON s.course_id = sc.course_id
    LEFT JOIN attendance a ON a.session_id = s.session_id AND a.student_id = u.id
    WHERE sc.course_id = ?
  `;

  const queryParams = [courseId];

  // Add class filter if provided
  if (classId) {
    query += ` AND sc.class_id = ? AND (s.class_id = ? OR s.class_id IS NULL)`;
    queryParams.push(classId, classId);
  } else {
    query += ` AND (s.class_id = sc.class_id OR s.class_id IS NULL)`;
  }

  query += `
    GROUP BY u.id, u.uid, u.admission_number, u.name, u.batch, sc.class, sc.class_id
    ORDER BY u.name
  `;

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error fetching eligibility:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    // Get course details
    const courseQuery = 'SELECT course_name FROM courses WHERE course_id = ?';
    db.query(courseQuery, [courseId], (err2, courseResult) => {
      if (err2) {
        console.error('Error fetching course:', err2);
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        course: courseResult[0] || null,
        students: results,
        summary: {
          total_students: results.length,
          eligible_students: results.filter(s => s.exam_eligibility === 'eligible').length,
          not_eligible_students: results.filter(s => s.exam_eligibility === 'not_eligible').length
        }
      });
    });
  });
});

// Check eligibility for a specific student
router.get('/student/:admissionNumber', (req, res) => {
  const { admissionNumber } = req.params;

  const query = `
    SELECT 
      u.name,
      u.admission_number,
      u.batch,
      c.course_id,
      c.course_name,
      sc.class,
      sc.class_id,
      COUNT(s.session_id) as total_sessions,
      COUNT(CASE WHEN a.status = 'present' OR a.status = 'Present' THEN 1 END) as present_sessions,
      ROUND(
        (COUNT(CASE WHEN a.status = 'present' OR a.status = 'Present' THEN 1 END) * 100.0 / 
         COUNT(s.session_id)), 2
      ) as attendance_percentage,
      CASE 
        WHEN ROUND(
          (COUNT(CASE WHEN a.status = 'present' OR a.status = 'Present' THEN 1 END) * 100.0 / 
           COUNT(s.session_id)), 2
        ) >= 80 THEN 'eligible'
        ELSE 'not_eligible'
      END as exam_eligibility
    FROM users u
    JOIN student_courses sc ON u.admission_number = sc.admission_number
    JOIN courses c ON sc.course_id = c.course_id
    JOIN sessions s ON s.course_id = sc.course_id
    LEFT JOIN attendance a ON a.session_id = s.session_id AND a.student_id = u.id
    WHERE u.admission_number = ?
    AND (s.class_id = sc.class_id OR s.class_id IS NULL)
    GROUP BY u.name, u.admission_number, u.batch, c.course_id, c.course_name, sc.class, sc.class_id
    ORDER BY c.course_name
  `;

  db.query(query, [admissionNumber], (err, results) => {
    if (err) {
      console.error('Error fetching student eligibility:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Student not found or no courses enrolled' });
    }

    res.json({
      student: {
        name: results[0].name,
        admission_number: results[0].admission_number,
        batch: results[0].batch
      },
      courses: results
    });
  });
});

// Get all eligible students (across all courses)
router.get('/eligible', (req, res) => {
  const query = `
    SELECT 
      u.id,
      u.uid,
      u.admission_number,
      u.name,
      u.batch,
      c.course_name,
      sc.class,
      COUNT(s.session_id) as total_sessions,
      COUNT(CASE WHEN a.status = 'present' OR a.status = 'Present' THEN 1 END) as present_sessions,
      ROUND(
        (COUNT(CASE WHEN a.status = 'present' OR a.status = 'Present' THEN 1 END) * 100.0 / 
         COUNT(s.session_id)), 2
      ) as attendance_percentage
    FROM users u
    JOIN student_courses sc ON u.admission_number = sc.admission_number
    JOIN courses c ON sc.course_id = c.course_id
    JOIN sessions s ON s.course_id = sc.course_id
    LEFT JOIN attendance a ON a.session_id = s.session_id AND a.student_id = u.id
    WHERE (s.class_id = sc.class_id OR s.class_id IS NULL)
    GROUP BY u.id, u.uid, u.admission_number, u.name, u.batch, c.course_name, sc.class
    HAVING attendance_percentage >= 80
    ORDER BY u.name, c.course_name
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching eligible students:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    res.json({ eligible_students: results });
  });
});

module.exports = router;