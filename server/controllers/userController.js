const db = require('../db');
const admin = require('../firebase/admin');

exports.registerStudent = async (req, res) => {
  const {
    name,
    email,
    password,
    admission_number,
    batch,
    whatsapp_number,
    residential_tel,
    gender,
    nic_number,
    address,
    school
  } = req.body;

  try {
    // 1. Create Firebase user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    const uid = userRecord.uid;

    // 2. Insert into MySQL
    const sql = `INSERT INTO users
      (uid, name, email, admission_number, batch, whatsapp_number, residential_tel, gender, nic_number, address, school)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [
      uid,
      name,
      email,
      admission_number,
      batch,
      whatsapp_number,
      residential_tel,
      gender,
      nic_number,
      address,
      school,
    ], (err, result) => {
      if (err) {
        console.error("MySQL Error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      res.status(201).json({ message: "Student registered successfully", uid });
    });

  } catch (err) {
    console.error("Firebase Error:", err);
    res.status(500).json({ message: "Firebase user creation failed" });
  }
};
