const express = require('express');
const db = require('../db');
const { registerStudent } = require('../controllers/userController');
const router = express.Router();

router.post('/register', registerStudent);

// Register admin route
router.post('/register-admin', (req, res) => {
  const { uid, name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const sql = 'INSERT INTO admins (uid, name, email, password) VALUES (?, ?, ?, ?)';
  db.query(sql, [uid, name, email, password], (err, result) => {
    if (err) {
      console.error('Error inserting admin:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(200).json({ message: 'Admin registered successfully' });
  });
});

module.exports = router;
