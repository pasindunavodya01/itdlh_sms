const express = require("express");
const router = express.Router();
const db = require("../db");

// Debug endpoint to check all users in database
router.get("/debug/users", (req, res) => {
  // Check admins
  const adminSql = "SELECT uid, name, email FROM admins";
  db.query(adminSql, (err, adminResult) => {
    if (err) {
      console.error("Error fetching admins:", err);
      return res.status(500).json({ message: "Database error" });
    }

    // Check students
    const studentSql = "SELECT uid, name, email, role FROM users";
    db.query(studentSql, (err, studentResult) => {
      if (err) {
        console.error("Error fetching students:", err);
        return res.status(500).json({ message: "Database error" });
      }

      res.status(200).json({
        admins: adminResult,
        students: studentResult,
        totalAdmins: adminResult.length,
        totalStudents: studentResult.length
      });
    });
  });
});

// Check user role endpoint
router.get("/check-role/:uid", (req, res) => {
  const { uid } = req.params;
  console.log('Checking role for UID:', uid);

  // First check if user is admin
  const adminSql = "SELECT * FROM admins WHERE uid = ?";
  db.query(adminSql, [uid], (err, adminResult) => {
    if (err) {
      console.error("Error checking admin:", err);
      return res.status(500).json({ message: "Database error" });
    }

    console.log('Admin check result:', adminResult);

    if (adminResult.length > 0) {
      return res.status(200).json({ role: "admin", user: adminResult[0] });
    }

    // If not admin, check if student
    const studentSql = "SELECT * FROM users WHERE uid = ?";
    db.query(studentSql, [uid], (err, studentResult) => {
      if (err) {
        console.error("Error checking student:", err);
        return res.status(500).json({ message: "Database error" });
      }

      console.log('Student check result:', studentResult);

      if (studentResult.length > 0) {
        return res.status(200).json({ role: "student", user: studentResult[0] });
      }

      // User not found in either table
      return res.status(404).json({ message: "User not found" });
    });
  });
});

// Get student profile with courses and payments
router.get("/profile/:uid", (req, res) => {
  const { uid } = req.params;

  // Get student data
  const studentSql = "SELECT * FROM users WHERE uid = ?";
  db.query(studentSql, [uid], (err, studentResult) => {
    if (err) {
      console.error("Error fetching student:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (studentResult.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const student = studentResult[0];

    // Get enrolled courses
    const coursesSql = `
      SELECT c.* 
      FROM courses c 
      INNER JOIN student_courses sc ON c.course_id = sc.course_id 
      WHERE sc.admission_number = ?
    `;
    
    db.query(coursesSql, [student.admission_number], (err, coursesResult) => {
      if (err) {
        console.error("Error fetching courses:", err);
        return res.status(500).json({ message: "Database error" });
      }

      // Get payment history
      const paymentsSql = `
        SELECT p.*, c.course_name 
        FROM payments p 
        INNER JOIN courses c ON p.course_id = c.course_id 
        WHERE p.admission_number = ?
      `;
      
      db.query(paymentsSql, [student.admission_number], (err, paymentsResult) => {
        if (err) {
          console.error("Error fetching payments:", err);
          return res.status(500).json({ message: "Database error" });
        }

        res.status(200).json({
          student,
          courses: coursesResult,
          payments: paymentsResult
        });
      });
    });
  });
});

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
