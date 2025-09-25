const express = require('express');
const router = express.Router();
const db = require('../db');

// Test route to verify server is working
router.get('/test', (req, res) => {
  res.json({ message: 'Marks API is working!' });
});

// Get all students with their basic info for marks management
router.get('/students', (req, res) => {
  const sql = `
    SELECT DISTINCT u.uid, u.admission_number, u.name, u.batch, u.email
    FROM users u
    WHERE u.role = 'student'
    ORDER BY u.name
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching students:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ students: results });
  });
});

// Get courses for a specific student
router.get('/students/:admissionNumber/courses', (req, res) => {
  const { admissionNumber } = req.params;
  
  const sql = `
    SELECT DISTINCT 
      c.course_id,
      c.course_name,
      sc.class_id,
      cc.class_name
    FROM student_courses sc
    INNER JOIN courses c ON sc.course_id = c.course_id
    LEFT JOIN course_classes cc ON sc.class_id = cc.class_id
    WHERE sc.admission_number = ?
    ORDER BY c.course_name
  `;
  
  db.query(sql, [admissionNumber], (err, results) => {
    if (err) {
      console.error('Error fetching student courses:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ courses: results });
  });
});

// Get sessions for a specific course and class
router.get('/courses/:courseId/sessions', (req, res) => {
  const { courseId } = req.params;
  const { classId } = req.query;
  
  let sql = `
    SELECT 
      s.session_id,
      s.date,
      s.topic,
      s.batch,
      c.course_name
    FROM sessions s
    INNER JOIN courses c ON s.course_id = c.course_id
    WHERE s.course_id = ?
  `;
  
  const params = [courseId];
  
  if (classId && classId !== 'null') {
    sql += ` AND s.class_id = ?`;
    params.push(classId);
  } else {
    sql += ` AND s.class_id IS NULL`;
  }
  
  sql += ` ORDER BY s.date DESC`;
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching sessions:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ sessions: results });
  });
});

// Get marks for a student in a specific session
router.get('/students/:admissionNumber/sessions/:sessionId/marks', (req, res) => {
  const { admissionNumber, sessionId } = req.params;
  
  const sql = `
    SELECT 
      m.*,
      s.topic,
      s.date,
      c.course_name
    FROM marks m
    INNER JOIN sessions s ON m.session_id = s.session_id
    INNER JOIN courses c ON m.course_id = c.course_id
    WHERE m.admission_number = ? AND m.session_id = ?
  `;
  
  db.query(sql, [admissionNumber, sessionId], (err, results) => {
    if (err) {
      console.error('Error fetching marks:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    
    if (results.length > 0) {
      res.json({ marks: results[0] });
    } else {
      res.json({ marks: null });
    }
  });
});

// Add or update marks for a student
router.post('/students/:admissionNumber/marks', (req, res) => {
  console.log('POST /students/:admissionNumber/marks called');
  console.log('Params:', req.params);
  console.log('Body:', req.body);
  
  const { admissionNumber } = req.params;
  const { course_id, class_id, marks_obtained, total_marks, grade } = req.body;
  
  // Validation
  if (!course_id || marks_obtained === undefined || total_marks === undefined) {
    return res.status(400).json({ message: 'Course ID, marks obtained and total marks are required' });
  }
  
  if (parseFloat(marks_obtained) < 0 || parseFloat(total_marks) <= 0) {
    return res.status(400).json({ message: 'Invalid marks values' });
  }
  
  if (parseFloat(marks_obtained) > parseFloat(total_marks)) {
    return res.status(400).json({ message: 'Marks obtained cannot exceed total marks' });
  }
  
  // Calculate grade if not provided
  let calculatedGrade = grade;
  if (!calculatedGrade) {
    const percentage = (parseFloat(marks_obtained) / parseFloat(total_marks)) * 100;
    if (percentage >= 90) calculatedGrade = 'A+';
    else if (percentage >= 85) calculatedGrade = 'A';
    else if (percentage >= 80) calculatedGrade = 'A-';
    else if (percentage >= 75) calculatedGrade = 'B+';
    else if (percentage >= 70) calculatedGrade = 'B';
    else if (percentage >= 65) calculatedGrade = 'B-';
    else if (percentage >= 60) calculatedGrade = 'C+';
    else if (percentage >= 55) calculatedGrade = 'C';
    else if (percentage >= 50) calculatedGrade = 'C-';
    else if (percentage >= 45) calculatedGrade = 'D+';
    else if (percentage >= 40) calculatedGrade = 'D';
    else calculatedGrade = 'F';
  }
  
  // Handle class_id properly - convert empty string to null
  const processedClassId = (class_id && class_id !== '') ? class_id : null;
  
  // Insert or update marks (with session_id as NULL since we're not using sessions)
  const marksSql = `
    INSERT INTO marks (admission_number, course_id, class_id, session_id, marks_obtained, total_marks, grade)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      marks_obtained = VALUES(marks_obtained),
      total_marks = VALUES(total_marks),
      grade = VALUES(grade)
  `;
  
  db.query(marksSql, [
    admissionNumber,
    course_id,
    processedClassId,
    null, // session_id as NULL
    parseFloat(marks_obtained),
    parseFloat(total_marks),
    calculatedGrade
  ], (err, result) => {
    if (err) {
      console.error('Error saving marks:', err);
      return res.status(500).json({ message: 'Database error', details: err.message });
    }
    
    res.json({
      success: true,
      message: 'Marks saved successfully',
      grade: calculatedGrade
    });
  });
});

// Update existing marks for a student
router.put('/students/:admissionNumber/marks', (req, res) => {
  console.log('PUT /students/:admissionNumber/marks called');
  console.log('Params:', req.params);
  console.log('Body:', req.body);
  
  const { admissionNumber } = req.params;
  const { course_id, class_id, marks_obtained, total_marks } = req.body;
  
  // Validation
  if (!course_id || marks_obtained === undefined || total_marks === undefined) {
    return res.status(400).json({ message: 'Course ID, marks obtained and total marks are required' });
  }
  
  if (parseFloat(marks_obtained) < 0 || parseFloat(total_marks) <= 0) {
    return res.status(400).json({ message: 'Invalid marks values' });
  }
  
  if (parseFloat(marks_obtained) > parseFloat(total_marks)) {
    return res.status(400).json({ message: 'Marks obtained cannot exceed total marks' });
  }
  
  // Always (re)calculate grade based on updated marks
  const percentage = (parseFloat(marks_obtained) / parseFloat(total_marks)) * 100;
  let calculatedGrade;
  if (percentage >= 90) calculatedGrade = 'A+';
  else if (percentage >= 85) calculatedGrade = 'A';
  else if (percentage >= 80) calculatedGrade = 'A-';
  else if (percentage >= 75) calculatedGrade = 'B+';
  else if (percentage >= 70) calculatedGrade = 'B';
  else if (percentage >= 65) calculatedGrade = 'B-';
  else if (percentage >= 60) calculatedGrade = 'C+';
  else if (percentage >= 55) calculatedGrade = 'C';
  else if (percentage >= 50) calculatedGrade = 'C-';
  else if (percentage >= 45) calculatedGrade = 'D+';
  else if (percentage >= 40) calculatedGrade = 'D';
  else calculatedGrade = 'F';
  
  // Handle class_id properly - convert empty string to null
  const processedClassId = (class_id && class_id !== '') ? class_id : null;
  
  // Update existing marks with proper class_id handling
  const updateSql = `
    UPDATE marks 
    SET marks_obtained = ?, total_marks = ?, grade = ?
    WHERE admission_number = ? AND course_id = ? 
    AND (
      (class_id = ? AND ? IS NOT NULL) OR 
      (class_id IS NULL AND ? IS NULL)
    )
  `;
  
  db.query(updateSql, [
    parseFloat(marks_obtained),
    parseFloat(total_marks),
    calculatedGrade,
    admissionNumber,
    course_id,
    processedClassId, processedClassId, processedClassId
  ], (err, result) => {
    if (err) {
      console.error('Error updating marks:', err);
      return res.status(500).json({ message: 'Database error', details: err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No marks found to update' });
    }
    
    res.json({
      success: true,
      message: 'Marks updated successfully',
      grade: calculatedGrade
    });
  });
});

// Delete marks for a student
router.delete('/students/:admissionNumber/marks', (req, res) => {
  const { admissionNumber } = req.params;
  const { course_id, class_id } = req.body;
  
  // Handle class_id properly
  const processedClassId = (class_id && class_id !== '') ? class_id : null;
  
  let sql = 'DELETE FROM marks WHERE admission_number = ? AND course_id = ?';
  const params = [admissionNumber, course_id];
  
  // Add class condition with proper null handling
  if (processedClassId !== null) {
    sql += ' AND class_id = ?';
    params.push(processedClassId);
  } else {
    sql += ' AND class_id IS NULL';
  }
  
  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Error deleting marks:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No marks found to delete' });
    }
    
    res.json({ success: true, message: 'Marks deleted successfully' });
  });
});

// Get all marks for a specific course - FIXED VERSION
router.get('/course/:courseId', (req, res) => {
  const { courseId } = req.params;
  const { classId } = req.query;
  
  let sql = `
    SELECT 
      m.*,
      u.name as student_name,
      c.course_name,
      CASE 
        WHEN m.class_id IS NOT NULL THEN cc.class_name
        ELSE 'All Classes'
      END as class_name,
      (m.marks_obtained / m.total_marks * 100) as percentage
    FROM marks m
    INNER JOIN users u ON m.admission_number = u.admission_number
    INNER JOIN courses c ON m.course_id = c.course_id
    LEFT JOIN course_classes cc ON m.class_id = cc.class_id
    WHERE m.course_id = ?
  `;
  
  const params = [courseId];
  
  // Handle class filtering properly
  if (classId && classId !== 'null' && classId !== '') {
    sql += ` AND m.class_id = ?`;
    params.push(classId);
  } else if (classId === '' || classId === 'null') {
    // When "All Classes" is selected, show all marks
    // No additional filter needed
  }
  
  sql += ` ORDER BY u.name`;
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching course marks:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ marks: results });
  });
});

// Get all marks for a student across all courses
router.get('/students/:admissionNumber/marks/summary', (req, res) => {
  const { admissionNumber } = req.params;
  
  const sql = `
    SELECT 
      m.*, 
      c.course_name, 
      CASE 
        WHEN m.class_id IS NOT NULL THEN cc.class_name
        ELSE 'All Classes'
      END as class_name,
      s.topic, 
      s.date, 
      (m.marks_obtained / m.total_marks * 100) as percentage
    FROM marks m
    INNER JOIN courses c ON m.course_id = c.course_id
    LEFT JOIN course_classes cc ON m.class_id = cc.class_id
    LEFT JOIN sessions s ON m.session_id = s.session_id
    WHERE m.admission_number = ?
    ORDER BY 
      CASE WHEN s.date IS NULL THEN 1 ELSE 0 END, 
      s.date DESC, 
      c.course_name
  `;
  
  db.query(sql, [admissionNumber], (err, results) => {
    if (err) {
      console.error('Error fetching marks summary:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ marks: results });
  });
});

// Get marks statistics for a course (updated with grade distribution)
router.get('/stats/course/:courseId', (req, res) => {
  const { courseId } = req.params;
  const { classId } = req.query;
  
  let baseSql = `
    FROM marks m
    WHERE m.course_id = ?
  `;
  
  const params = [courseId];
  
  // Handle class filtering for stats
  if (classId && classId !== 'null' && classId !== '') {
    baseSql += ` AND m.class_id = ?`;
    params.push(classId);
  }
  
  // Get overall statistics
  const overallSql = `
    SELECT 
      COUNT(*) as total_students,
      AVG(m.marks_obtained / m.total_marks * 100) as overall_avg,
      MAX(m.marks_obtained / m.total_marks * 100) as overall_max,
      MIN(m.marks_obtained / m.total_marks * 100) as overall_min,
      COUNT(CASE WHEN m.marks_obtained / m.total_marks * 100 >= 40 THEN 1 END) as passed_count,
      COUNT(CASE WHEN m.marks_obtained / m.total_marks * 100 < 40 THEN 1 END) as failed_count
    ${baseSql}
  `;
  
  // Get grade distribution
  const gradeDistributionSql = `
    SELECT 
      m.grade,
      COUNT(*) as count
    ${baseSql}
    GROUP BY m.grade
    ORDER BY 
      CASE m.grade
        WHEN 'A+' THEN 1
        WHEN 'A' THEN 2
        WHEN 'A-' THEN 3
        WHEN 'B+' THEN 4
        WHEN 'B' THEN 5
        WHEN 'B-' THEN 6
        WHEN 'C+' THEN 7
        WHEN 'C' THEN 8
        WHEN 'C-' THEN 9
        WHEN 'D+' THEN 10
        WHEN 'D' THEN 11
        WHEN 'F' THEN 12
        ELSE 13
      END
  `;
  
  // Execute both queries
  db.query(overallSql, params, (err, overallResults) => {
    if (err) {
      console.error('Error fetching overall statistics:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    
    db.query(gradeDistributionSql, params, (err, gradeResults) => {
      if (err) {
        console.error('Error fetching grade distribution:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      
      const overallStats = overallResults[0];
      
      if (overallStats.total_students === 0) {
        return res.json({
          overall_stats: {
            total_students: 0,
            overall_avg: 0,
            overall_max: 0,
            overall_min: 0,
            passed_count: 0,
            failed_count: 0,
            pass_rate: 0
          },
          grade_distribution: []
        });
      }
      
      res.json({
        overall_stats: {
          total_students: overallStats.total_students,
          overall_avg: parseFloat(overallStats.overall_avg),
          overall_max: parseFloat(overallStats.overall_max),
          overall_min: parseFloat(overallStats.overall_min),
          passed_count: overallStats.passed_count,
          failed_count: overallStats.failed_count,
          pass_rate: ((overallStats.passed_count / overallStats.total_students) * 100)
        },
        grade_distribution: gradeResults
      });
    });
  });
});

module.exports = router;