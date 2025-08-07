const express = require('express');
const router = express.Router();
const db = require('../db');
const adminSDK = require('../firebase/admin'); // your Firebase Admin SDK instance

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Create user in Firebase Authentication
    const userRecord = await adminSDK.auth().createUser({
      email,
      password,
      displayName: name,
    });

    const uid = userRecord.uid;

    // 2. Save admin info in MySQL admins table
    const sql = `
      INSERT INTO admins (uid, name, email)
      VALUES (?, ?, ?)
    `;

    db.query(sql, [uid, name, email], (err, result) => {
      if (err) {
        console.error("MySQL error:", err);
        return res.status(500).json({ message: "Database error" });
      }
      res.status(201).json({ message: "Admin registered successfully", uid });
    });
  } catch (error) {
    console.error("Firebase error:", error);
    res.status(500).json({ message: "Firebase user creation failed" });
  }
});

module.exports = router;
