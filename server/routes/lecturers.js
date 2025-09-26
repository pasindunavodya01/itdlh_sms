const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all lecturers
router.get('/', (req, res) => {
  const query = `
    SELECT lecturer_id, name, title, bio, image_url 
    FROM lecturers 
    ORDER BY name
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching lecturers:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});

module.exports = router;