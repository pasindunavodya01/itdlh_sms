const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/register", (req, res) => {
  const {
    uid,
    admission_number,
    batch,
    name,
    residential_tel,
    whatsapp_number,
    gender,
    nic_number,
    email,
    address,
    school,
  } = req.body;

  const sql = `
    INSERT INTO users (uid, role, admission_number, batch, name, residential_tel, whatsapp_number, gender, nic_number, email, address, school)
    VALUES (?, 'student', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [uid, admission_number, batch, name, residential_tel, whatsapp_number, gender, nic_number, email, address, school],
    (err, result) => {
      if (err) {
        console.error("Error inserting student:", err);
        return res.status(500).json({ message: "Database error" });
      }
      res.status(200).json({ message: "Student registered successfully" });
    }
  );
});

module.exports = router;
