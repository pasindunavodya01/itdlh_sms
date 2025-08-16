const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all courses with their classes
router.get('/', (req, res) => {
  const query = `
    SELECT c.course_id, c.course_name, c.amount, 
           cc.class_id, cc.class_name
    FROM courses c
    LEFT JOIN course_classes cc ON c.course_id = cc.course_id
    ORDER BY c.course_id, cc.class_id
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // Transform flat rows into nested structure: courses with classes array
    const coursesMap = new Map();
    results.forEach(row => {
      if (!coursesMap.has(row.course_id)) {
        coursesMap.set(row.course_id, {
          course_id: row.course_id,
          course_name: row.course_name,
          amount: row.amount,
          classes: []
        });
      }
      if (row.class_id) {
        coursesMap.get(row.course_id).classes.push({
          class_id: row.class_id,
          class_name: row.class_name
        });
      }
    });
    res.json(Array.from(coursesMap.values()));
  });
});

// Add new course with classes
router.post('/', (req, res) => {
  const { course_name, amount, classes } = req.body;

  if (!course_name || !amount) {
    return res.status(400).json({ error: 'Course name and amount are required' });
  }

  db.query(
    'INSERT INTO courses (course_name, amount) VALUES (?, ?)',
    [course_name, amount],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      const courseId = result.insertId;

      if (classes && classes.length > 0) {
        const classValues = classes.map(c => [courseId, c.class_name]);
        const insertClassesQuery = 'INSERT INTO course_classes (course_id, class_name) VALUES ?';
        db.query(insertClassesQuery, [classValues], (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });
          res.status(201).json({ message: 'Course and classes added successfully', course_id: courseId });
        });
      } else {
        res.status(201).json({ message: 'Course added successfully', course_id: courseId });
      }
    }
  );
});

// Update course and classes
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { course_name, amount, classes } = req.body;

  if (!course_name || !amount) {
    return res.status(400).json({ error: 'Course name and amount are required' });
  }

  db.query(
    'UPDATE courses SET course_name = ?, amount = ? WHERE course_id = ?',
    [course_name, amount, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Course not found' });

      if (!Array.isArray(classes)) {
        // If no classes sent, just respond success
        return res.json({ message: 'Course updated successfully' });
      }

      // Get existing class_ids for this course
      db.query('SELECT class_id FROM course_classes WHERE course_id = ?', [id], (err2, existingClasses) => {
        if (err2) return res.status(500).json({ error: err2.message });

        const existingIds = existingClasses.map(c => c.class_id);
        const sentIds = classes.filter(c => c.class_id).map(c => c.class_id);

        // Classes to delete
        const toDelete = existingIds.filter(cid => !sentIds.includes(cid));

        // Delete removed classes
        const deleteClasses = () => {
          if (toDelete.length === 0) return upsertClasses();

          db.query('DELETE FROM course_classes WHERE class_id IN (?)', [toDelete], (err3) => {
            if (err3) return res.status(500).json({ error: err3.message });
            upsertClasses();
          });
        };

        // Insert new classes (no class_id yet)
        const insertNewClasses = (callback) => {
          const newClasses = classes.filter(c => !c.class_id);
          if (newClasses.length === 0) return callback();

          const insertValues = newClasses.map(c => [id, c.class_name]);
          db.query('INSERT INTO course_classes (course_id, class_name) VALUES ?', [insertValues], (err4) => {
            if (err4) return res.status(500).json({ error: err4.message });
            callback();
          });
        };

        // Update existing classes
        const updateExistingClasses = () => {
          const updates = classes.filter(c => c.class_id);
          if (updates.length === 0) return res.json({ message: 'Course and classes updated successfully' });

          let completed = 0;
          let hasError = false;
          updates.forEach(c => {
            db.query('UPDATE course_classes SET class_name = ? WHERE class_id = ?', [c.class_name, c.class_id], (err5) => {
              if (hasError) return;
              if (err5) {
                hasError = true;
                return res.status(500).json({ error: err5.message });
              }
              completed++;
              if (completed === updates.length) {
                res.json({ message: 'Course and classes updated successfully' });
              }
            });
          });
        };

        // Run insertion then update
        function upsertClasses() {
          insertNewClasses(updateExistingClasses);
        }

        deleteClasses();
      });
    }
  );
});

// Delete course (will cascade delete classes if FK is set with ON DELETE CASCADE)
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM courses WHERE course_id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Course not found' });
    res.json({ message: 'Course deleted successfully' });
  });
});

// Get single course with classes by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT c.course_id, c.course_name, c.amount,
           cc.class_id, cc.class_name
    FROM courses c
    LEFT JOIN course_classes cc ON c.course_id = cc.course_id
    WHERE c.course_id = ?
    ORDER BY cc.class_id
  `;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Course not found' });

    const course = {
      course_id: results[0].course_id,
      course_name: results[0].course_name,
      amount: results[0].amount,
      classes: []
    };

    results.forEach(row => {
      if (row.class_id) {
        course.classes.push({
          class_id: row.class_id,
          class_name: row.class_name
        });
      }
    });

    res.json(course);
  });
});

module.exports = router;
