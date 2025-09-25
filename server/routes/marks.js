const express = require('express');
const router = express.Router();
const db = require('../db');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Lesson-based Marks API is working!' });
});

// ===== LESSON MANAGEMENT ROUTES =====

// Get all lessons for a specific course
router.get('/courses/:courseId/lessons', (req, res) => {
  const { courseId } = req.params;
  const { classId } = req.query;
  
  let sql = `
    SELECT 
      cl.*,
      CASE 
        WHEN cl.class_id IS NOT NULL THEN cc.class_name
        ELSE 'All Classes'
      END as class_name,
      COUNT(lm.mark_id) as marked_students,
      (SELECT COUNT(DISTINCT sc.admission_number) 
       FROM student_courses sc 
       WHERE sc.course_id = cl.course_id 
       AND (cl.class_id IS NULL OR sc.class_id = cl.class_id)) as total_students
    FROM course_lessons cl
    LEFT JOIN course_classes cc ON cl.class_id = cc.class_id
    LEFT JOIN lesson_marks lm ON cl.lesson_id = lm.lesson_id
    WHERE cl.course_id = ?
  `;
  
  const params = [courseId];
  
  if (classId && classId !== 'null' && classId !== '') {
    sql += ` AND (cl.class_id = ? OR cl.class_id IS NULL)`;
    params.push(classId);
  }
  
  sql += ` GROUP BY cl.lesson_id ORDER BY cl.due_date ASC, cl.lesson_name`;
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching lessons:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ lessons: results });
  });
});

// Create new lesson
router.post('/courses/:courseId/lessons', (req, res) => {
  const { courseId } = req.params;
  const { 
    lesson_name, 
    lesson_type, 
    weightage, 
    max_marks, 
    description, 
    due_date, 
    class_id 
  } = req.body;
  
  if (!lesson_name || !weightage || !max_marks) {
    return res.status(400).json({ message: 'Lesson name, weightage, and max marks are required' });
  }
  
  // Check if total weightage will exceed 100%
  const checkWeightageSql = `
    SELECT SUM(weightage) as total_weightage 
    FROM course_lessons 
    WHERE course_id = ? AND (class_id = ? OR (class_id IS NULL AND ? IS NULL))
  `;
  
  const processedClassId = (class_id && class_id !== '') ? class_id : null;
  
  db.query(checkWeightageSql, [courseId, processedClassId, processedClassId], (err, results) => {
    if (err) {
      console.error('Error checking weightage:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    
    const currentTotal = results[0]?.total_weightage || 0;
    if (currentTotal + parseFloat(weightage) > 100) {
      return res.status(400).json({ 
        message: `Total weightage would exceed 100%. Current total: ${currentTotal}%` 
      });
    }
    
    const insertSql = `
      INSERT INTO course_lessons (
        course_id, class_id, lesson_name, lesson_type, 
        weightage, max_marks, description, due_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(insertSql, [
      courseId, 
      processedClassId, 
      lesson_name, 
      lesson_type || 'assignment', 
      parseFloat(weightage), 
      parseFloat(max_marks), 
      description || null, 
      due_date || null
    ], (err, result) => {
      if (err) {
        console.error('Error creating lesson:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      
      res.json({ 
        success: true, 
        message: 'Lesson created successfully',
        lesson_id: result.insertId 
      });
    });
  });
});

// Update lesson
router.put('/lessons/:lessonId', (req, res) => {
  const { lessonId } = req.params;
  const { 
    lesson_name, 
    lesson_type, 
    weightage, 
    max_marks, 
    description, 
    due_date 
  } = req.body;
  
  if (!lesson_name || !weightage || !max_marks) {
    return res.status(400).json({ message: 'Lesson name, weightage, and max marks are required' });
  }
  
  // First get the current lesson to check weightage
  const getCurrentSql = `
    SELECT course_id, class_id, weightage 
    FROM course_lessons 
    WHERE lesson_id = ?
  `;
  
  db.query(getCurrentSql, [lessonId], (err, currentResults) => {
    if (err) {
      console.error('Error fetching current lesson:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    
    if (currentResults.length === 0) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    const currentLesson = currentResults[0];
    
    // Check if new weightage is valid
    const checkWeightageSql = `
      SELECT SUM(weightage) as total_weightage 
      FROM course_lessons 
      WHERE course_id = ? 
      AND (class_id = ? OR (class_id IS NULL AND ? IS NULL))
      AND lesson_id != ?
    `;
    
    db.query(checkWeightageSql, [
      currentLesson.course_id, 
      currentLesson.class_id, 
      currentLesson.class_id, 
      lessonId
    ], (err, weightageResults) => {
      if (err) {
        console.error('Error checking weightage:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      
      const otherLessonsTotal = weightageResults[0]?.total_weightage || 0;
      if (otherLessonsTotal + parseFloat(weightage) > 100) {
        return res.status(400).json({ 
          message: `Total weightage would exceed 100%. Other lessons total: ${otherLessonsTotal}%` 
        });
      }
      
      const updateSql = `
        UPDATE course_lessons 
        SET lesson_name = ?, lesson_type = ?, weightage = ?, 
            max_marks = ?, description = ?, due_date = ?
        WHERE lesson_id = ?
      `;
      
      db.query(updateSql, [
        lesson_name, 
        lesson_type || 'assignment', 
        parseFloat(weightage), 
        parseFloat(max_marks), 
        description || null, 
        due_date || null, 
        lessonId
      ], (err, result) => {
        if (err) {
          console.error('Error updating lesson:', err);
          return res.status(500).json({ message: 'Database error' });
        }
        
        res.json({ success: true, message: 'Lesson updated successfully' });
      });
    });
  });
});

// Delete lesson
router.delete('/lessons/:lessonId', (req, res) => {
  const { lessonId } = req.params;
  
  // Check if lesson has any marks
  const checkMarksSql = 'SELECT COUNT(*) as mark_count FROM lesson_marks WHERE lesson_id = ?';
  
  db.query(checkMarksSql, [lessonId], (err, results) => {
    if (err) {
      console.error('Error checking marks:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    
    if (results[0].mark_count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete lesson with existing marks. Please remove all marks first.' 
      });
    }
    
    const deleteSql = 'DELETE FROM course_lessons WHERE lesson_id = ?';
    
    db.query(deleteSql, [lessonId], (err, result) => {
      if (err) {
        console.error('Error deleting lesson:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Lesson not found' });
      }
      
      res.json({ success: true, message: 'Lesson deleted successfully' });
    });
  });
});

// ===== LESSON MARKS MANAGEMENT =====

// Get marks for a specific lesson
router.get('/lessons/:lessonId/marks', (req, res) => {
  const { lessonId } = req.params;
  
  const sql = `
    SELECT 
      lm.*,
      u.name as student_name,
      cl.lesson_name,
      cl.max_marks,
      cl.weightage,
      cl.lesson_type,
      (lm.marks_obtained / cl.max_marks * 100) as percentage
    FROM lesson_marks lm
    INNER JOIN users u ON lm.admission_number = u.admission_number
    INNER JOIN course_lessons cl ON lm.lesson_id = cl.lesson_id
    WHERE lm.lesson_id = ?
    ORDER BY u.name
  `;
  
  db.query(sql, [lessonId], (err, results) => {
    if (err) {
      console.error('Error fetching lesson marks:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ marks: results });
  });
});

// Get all students eligible for a lesson (with their current marks if any)
router.get('/lessons/:lessonId/students', (req, res) => {
  const { lessonId } = req.params;
  
  const sql = `
    SELECT 
      u.admission_number,
      u.name as student_name,
      u.email,
      lm.marks_obtained,
      lm.grade,
      lm.remarks,
      lm.marked_at,
      cl.lesson_name,
      cl.max_marks,
      cl.lesson_type,
      cl.weightage
    FROM course_lessons cl
    INNER JOIN student_courses sc ON cl.course_id = sc.course_id 
      AND (cl.class_id IS NULL OR cl.class_id = sc.class_id)
    INNER JOIN users u ON sc.admission_number = u.admission_number
    LEFT JOIN lesson_marks lm ON cl.lesson_id = lm.lesson_id 
      AND u.admission_number = lm.admission_number
    WHERE cl.lesson_id = ?
    ORDER BY u.name
  `;
  
  db.query(sql, [lessonId], (err, results) => {
    if (err) {
      console.error('Error fetching lesson students:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ students: results });
  });
});

// Add or update marks for a lesson
router.post('/lessons/:lessonId/marks', (req, res) => {
  const { lessonId } = req.params;
  const { admission_number, marks_obtained, grade, remarks } = req.body;
  
  if (!admission_number || marks_obtained === undefined) {
    return res.status(400).json({ message: 'Admission number and marks obtained are required' });
  }
  
  // Get lesson details for validation
  const lessonSql = 'SELECT * FROM course_lessons WHERE lesson_id = ?';
  
  db.query(lessonSql, [lessonId], (err, lessonResults) => {
    if (err) {
      console.error('Error fetching lesson:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    
    if (lessonResults.length === 0) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    const lesson = lessonResults[0];
    
    if (parseFloat(marks_obtained) < 0 || parseFloat(marks_obtained) > lesson.max_marks) {
      return res.status(400).json({ 
        message: `Marks must be between 0 and ${lesson.max_marks}` 
      });
    }
    
    // Calculate grade if not provided
    let calculatedGrade = grade;
    if (!calculatedGrade) {
      const percentage = (parseFloat(marks_obtained) / lesson.max_marks) * 100;
      if (percentage >= 97) calculatedGrade = 'A+';
      else if (percentage >= 93) calculatedGrade = 'A';
      else if (percentage >= 90) calculatedGrade = 'A-';
      else if (percentage >= 87) calculatedGrade = 'B+';
      else if (percentage >= 83) calculatedGrade = 'B';
      else if (percentage >= 80) calculatedGrade = 'B-';
      else if (percentage >= 77) calculatedGrade = 'C+';
      else if (percentage >= 73) calculatedGrade = 'C';
      else if (percentage >= 70) calculatedGrade = 'C-';
      else if (percentage >= 67) calculatedGrade = 'D+';
      else if (percentage >= 65) calculatedGrade = 'D';
      else calculatedGrade = 'F';
    }
    
    const marksSql = `
      INSERT INTO lesson_marks (admission_number, lesson_id, marks_obtained, grade, remarks)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        marks_obtained = VALUES(marks_obtained),
        grade = VALUES(grade),
        remarks = VALUES(remarks),
        updated_at = CURRENT_TIMESTAMP
    `;
    
    db.query(marksSql, [
      admission_number,
      lessonId,
      parseFloat(marks_obtained),
      calculatedGrade,
      remarks || null
    ], (err, result) => {
      if (err) {
        console.error('Error saving lesson marks:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      
      // Recalculate final grade for this student and course
      const recalculateSql = 'CALL CalculateFinalGrade(?, ?, ?)';
      
      db.query(recalculateSql, [
        admission_number, 
        lesson.course_id, 
        lesson.class_id
      ], (err) => {
        if (err) {
          console.warn('Warning: Could not recalculate final grade:', err);
          // Don't fail the request, just warn
        }
        
        res.json({
          success: true,
          message: 'Marks saved successfully',
          grade: calculatedGrade
        });
      });
    });
  });
});

// Delete lesson marks
router.delete('/lessons/:lessonId/marks/:admissionNumber', (req, res) => {
  const { lessonId, admissionNumber } = req.params;
  
  // Get lesson details for final grade recalculation
  const lessonSql = 'SELECT course_id, class_id FROM course_lessons WHERE lesson_id = ?';
  
  db.query(lessonSql, [lessonId], (err, lessonResults) => {
    if (err) {
      console.error('Error fetching lesson:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    
    if (lessonResults.length === 0) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    const lesson = lessonResults[0];
    
    const deleteSql = 'DELETE FROM lesson_marks WHERE lesson_id = ? AND admission_number = ?';
    
    db.query(deleteSql, [lessonId, admissionNumber], (err, result) => {
      if (err) {
        console.error('Error deleting marks:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Marks not found' });
      }
      
      // Recalculate final grade
      const recalculateSql = 'CALL CalculateFinalGrade(?, ?, ?)';
      
      db.query(recalculateSql, [
        admissionNumber, 
        lesson.course_id, 
        lesson.class_id
      ], (err) => {
        if (err) {
          console.warn('Warning: Could not recalculate final grade:', err);
        }
        
        res.json({ success: true, message: 'Marks deleted successfully' });
      });
    });
  });
});

// ===== FINAL GRADES AND STATISTICS =====

// Get final grades for a course
router.get('/courses/:courseId/final-grades', (req, res) => {
  const { courseId } = req.params;
  const { classId } = req.query;
  
  let sql = `
    SELECT 
      cfg.*,
      u.name as student_name,
      c.course_name,
      CASE 
        WHEN cfg.class_id IS NOT NULL THEN cc.class_name
        ELSE 'All Classes'
      END as class_name,
      scp.completed_lessons,
      scp.total_lessons,
      scp.completion_percentage
    FROM course_final_grades cfg
    LEFT JOIN users u ON cfg.admission_number = u.admission_number
    LEFT JOIN courses c ON cfg.course_id = c.course_id
    LEFT JOIN course_classes cc ON cfg.class_id = cc.class_id
    LEFT JOIN student_course_progress scp ON cfg.admission_number = scp.admission_number 
      AND cfg.course_id = scp.course_id 
      AND (cfg.class_id = scp.class_id OR (cfg.class_id IS NULL AND scp.class_id IS NULL))
    WHERE cfg.course_id = ?
  `;
  
  const params = [courseId];
  
  if (classId && classId !== 'null' && classId !== '') {
    sql += ` AND cfg.class_id = ?`;
    params.push(classId);
  } else if (classId === '' || classId === 'null') {
    sql += ` AND cfg.class_id IS NULL`;
  }
  
  sql += ` ORDER BY u.name`;
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching final grades:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ grades: results });
  });
});

// Get detailed progress for a student in a course
router.get('/students/:admissionNumber/courses/:courseId/progress', (req, res) => {
  const { admissionNumber, courseId } = req.params;
  const { classId } = req.query;
  
  const processedClassId = (classId && classId !== 'null' && classId !== '') ? classId : null;
  
  // Get lesson marks
  const lessonsSql = `
    SELECT 
      cl.*,
      lm.marks_obtained,
      lm.grade as lesson_grade,
      lm.remarks,
      lm.marked_at,
      CASE WHEN lm.marks_obtained IS NOT NULL THEN 
        (lm.marks_obtained / cl.max_marks * 100)
      ELSE NULL END as percentage,
      CASE WHEN lm.marks_obtained IS NOT NULL THEN 
        (lm.marks_obtained / cl.max_marks * cl.weightage)
      ELSE 0 END as weighted_points
    FROM course_lessons cl
    LEFT JOIN lesson_marks lm ON cl.lesson_id = lm.lesson_id 
      AND lm.admission_number = ?
    WHERE cl.course_id = ? 
      AND (cl.class_id = ? OR (cl.class_id IS NULL AND ? IS NULL))
    ORDER BY cl.due_date ASC, cl.lesson_name
  `;
  
  // Get final grade
  const finalGradeSql = `
    SELECT * FROM course_final_grades 
    WHERE admission_number = ? AND course_id = ? 
      AND (class_id = ? OR (class_id IS NULL AND ? IS NULL))
  `;
  
  db.query(lessonsSql, [
    admissionNumber, courseId, processedClassId, processedClassId
  ], (err, lessonResults) => {
    if (err) {
      console.error('Error fetching student progress:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    
    db.query(finalGradeSql, [
      admissionNumber, courseId, processedClassId, processedClassId
    ], (err, gradeResults) => {
      if (err) {
        console.error('Error fetching final grade:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      
      res.json({
        lessons: lessonResults,
        final_grade: gradeResults[0] || null,
        summary: {
          total_lessons: lessonResults.length,
          completed_lessons: lessonResults.filter(l => l.marks_obtained !== null).length,
          total_possible_weighted_points: lessonResults.reduce((sum, l) => sum + l.weightage, 0),
          earned_weighted_points: lessonResults.reduce((sum, l) => sum + l.weighted_points, 0)
        }
      });
    });
  });
});

// Recalculate all final grades for a course
router.post('/courses/:courseId/recalculate-grades', (req, res) => {
  const { courseId } = req.params;
  const { classId } = req.query;
  
  const processedClassId = (classId && classId !== 'null' && classId !== '') ? classId : null;
  
  // Get all students in the course
  const studentsSql = `
    SELECT DISTINCT sc.admission_number 
    FROM student_courses sc 
    WHERE sc.course_id = ? 
      AND (sc.class_id = ? OR (? IS NULL))
  `;
  
  db.query(studentsSql, [courseId, processedClassId, processedClassId], (err, students) => {
    if (err) {
      console.error('Error fetching students:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    
    let completed = 0;
    const total = students.length;
    
    if (total === 0) {
      return res.json({ 
        success: true, 
        message: 'No students found for recalculation' 
      });
    }
    
    students.forEach(student => {
      const recalculateSql = 'CALL CalculateFinalGrade(?, ?, ?)';
      
      db.query(recalculateSql, [
        student.admission_number, 
        courseId, 
        processedClassId
      ], (err) => {
        completed++;
        
        if (err) {
          console.error(`Error recalculating grade for ${student.admission_number}:`, err);
        }
        
        if (completed === total) {
          res.json({ 
            success: true, 
            message: `Recalculated grades for ${total} students` 
          });
        }
      });
    });
  });
});

// Get course statistics including lesson-wise performance
router.get('/courses/:courseId/statistics', (req, res) => {
  const { courseId } = req.params;
  const { classId } = req.query;
  
  const processedClassId = (classId && classId !== 'null' && classId !== '') ? classId : null;
  
  // Overall course statistics
  const overallSql = `
    SELECT 
      COUNT(DISTINCT cfg.admission_number) as total_students,
      AVG(cfg.final_percentage) as overall_avg,
      MAX(cfg.final_percentage) as overall_max,
      MIN(cfg.final_percentage) as overall_min,
      AVG(cfg.gpa_points) as avg_gpa,
      COUNT(CASE WHEN cfg.final_percentage >= 65 THEN 1 END) as passed_count,
      COUNT(CASE WHEN cfg.final_percentage < 65 THEN 1 END) as failed_count
    FROM course_final_grades cfg
    WHERE cfg.course_id = ?
      AND (cfg.class_id = ? OR (cfg.class_id IS NULL AND ? IS NULL))
  `;
  
  // Grade distribution
  const gradeDistributionSql = `
    SELECT 
      cfg.final_grade,
      COUNT(*) as count
    FROM course_final_grades cfg
    WHERE cfg.course_id = ?
      AND (cfg.class_id = ? OR (cfg.class_id IS NULL AND ? IS NULL))
    GROUP BY cfg.final_grade
    ORDER BY 
      CASE cfg.final_grade
        WHEN 'A+' THEN 1 WHEN 'A' THEN 2 WHEN 'A-' THEN 3
        WHEN 'B+' THEN 4 WHEN 'B' THEN 5 WHEN 'B-' THEN 6
        WHEN 'C+' THEN 7 WHEN 'C' THEN 8 WHEN 'C-' THEN 9
        WHEN 'D+' THEN 10 WHEN 'D' THEN 11 WHEN 'F' THEN 12
        ELSE 13
      END
  `;
  
  // Lesson-wise statistics
  const lessonStatsSql = `
    SELECT 
      cl.lesson_id,
      cl.lesson_name,
      cl.lesson_type,
      cl.weightage,
      cl.max_marks,
      COUNT(lm.mark_id) as submissions,
      AVG(lm.marks_obtained / cl.max_marks * 100) as avg_percentage,
      MAX(lm.marks_obtained / cl.max_marks * 100) as max_percentage,
      MIN(lm.marks_obtained / cl.max_marks * 100) as min_percentage,
      COUNT(CASE WHEN lm.marks_obtained / cl.max_marks >= 0.65 THEN 1 END) as passed_submissions
    FROM course_lessons cl
    LEFT JOIN lesson_marks lm ON cl.lesson_id = lm.lesson_id
    WHERE cl.course_id = ?
      AND (cl.class_id = ? OR (cl.class_id IS NULL AND ? IS NULL))
    GROUP BY cl.lesson_id
    ORDER BY cl.due_date ASC, cl.lesson_name
  `;
  
  const params = [courseId, processedClassId, processedClassId];
  
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
      
      db.query(lessonStatsSql, params, (err, lessonResults) => {
        if (err) {
          console.error('Error fetching lesson statistics:', err);
          return res.status(500).json({ message: 'Database error' });
        }
        
        // Process the results to ensure valid numbers
        const processedLessonResults = lessonResults.map(lesson => ({
          ...lesson,
          avg_percentage: lesson.avg_percentage ? parseFloat(lesson.avg_percentage) : 0,
          max_percentage: lesson.max_percentage ? parseFloat(lesson.max_percentage) : 0,
          min_percentage: lesson.min_percentage ? parseFloat(lesson.min_percentage) : 0,
          submissions: lesson.submissions || 0,
          passed_submissions: lesson.passed_submissions || 0
        }));

        const overallStats = overallResults[0];
        
        res.json({
          overall_stats: {
            total_students: overallStats.total_students || 0,
            overall_avg: parseFloat(overallStats.overall_avg || 0),
            overall_max: parseFloat(overallStats.overall_max || 0),
            overall_min: parseFloat(overallStats.overall_min || 0),
            avg_gpa: parseFloat(overallStats.avg_gpa || 0),
            passed_count: overallStats.passed_count || 0,
            failed_count: overallStats.failed_count || 0,
            pass_rate: overallStats.total_students ? 
              (overallStats.passed_count / overallStats.total_students * 100) : 0
          },
          grade_distribution: gradeResults,
          lesson_statistics: processedLessonResults  // Use processed results
        });
      });
    });
  });
});

// ===== BACKWARD COMPATIBILITY ROUTES =====
// These routes maintain compatibility with your existing frontend

// Get all students with their basic info (unchanged)
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

// Legacy route - redirects to final grades
router.get('/course/:courseId', (req, res) => {
  res.redirect(`/api/marks/courses/${req.params.courseId}/final-grades${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`);
});

// Legacy stats route
router.get('/stats/course/:courseId', (req, res) => {
  res.redirect(`/api/marks/courses/${req.params.courseId}/statistics${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`);
});

module.exports = router;