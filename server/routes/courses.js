// server/routes/courses.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all courses
router.get("/", (req, res) => {
  db.query("SELECT course_id, course_name, amount FROM courses", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
