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

// Add new course
router.post("/", (req, res) => {
  const { course_name, amount } = req.body;
  
  if (!course_name || !amount) {
    return res.status(400).json({ error: "Course name and amount are required" });
  }

  const query = "INSERT INTO courses (course_name, amount) VALUES (?, ?)";
  db.query(query, [course_name, amount], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ 
      message: "Course added successfully", 
      course_id: result.insertId 
    });
  });
});

// Update course
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { course_name, amount } = req.body;
  
  if (!course_name || !amount) {
    return res.status(400).json({ error: "Course name and amount are required" });
  }

  const query = "UPDATE courses SET course_name = ?, amount = ? WHERE course_id = ?";
  db.query(query, [course_name, amount, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json({ message: "Course updated successfully" });
  });
});

// Delete course
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  
  const query = "DELETE FROM courses WHERE course_id = ?";
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json({ message: "Course deleted successfully" });
  });
});

// Get single course by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  
  const query = "SELECT course_id, course_name, amount FROM courses WHERE course_id = ?";
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json(results[0]);
  });
});

module.exports = router;
