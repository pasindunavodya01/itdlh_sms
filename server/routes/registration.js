const express = require("express");
const router = express.Router();
const db = require("../db");
const admin = require("../firebase/admin"); // Your Firebase admin SDK

router.post("/full-register", async (req, res) => {
  const { student, courses, payments, password } = req.body;

  // 1. Register user in Firebase Auth
  let firebaseUser;
  try {
    firebaseUser = await admin.auth().createUser({
      email: student.email,
      password: password,
      displayName: student.name,
    });
  } catch (err) {
    return res.status(500).json({ error: "Firebase registration failed", details: err.message });
  }

  // 2. Store student in users table
  const sql = `
    INSERT INTO users (uid, role, admission_number, batch, name, residential_tel, whatsapp_number, gender, nic_number, email, address, school)
    VALUES (?, 'student', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(
    sql,
    [
      firebaseUser.uid,
      student.admission_number,
      student.batch,
      student.name,
      student.residential_tel,
      student.whatsapp_number,
      student.gender,
      student.nic_number,
      student.email,
      student.address,
      student.school,
    ],
    (err) => {
      if (err) return res.status(500).json({ error: "Database error (users)" });

      // 3. Store courses in student_courses table
      const courseValues = courses.map((c) => [student.admission_number, c.course_id, c.class]);
      const courseSql = `INSERT INTO student_courses (admission_number, course_id, class) VALUES ?`;
      db.query(courseSql, [courseValues], (err) => {
        if (err) return res.status(500).json({ error: "Database error (student_courses)" });

        // 4. Store payments in payments table
        // Use the payment data directly from the frontend (already calculated correctly)
        const paymentValues = payments.map((payment) => [
          student.admission_number,
          payment.course_id,
          payment.amount_due,
          payment.amount_paid,
          payment.payment_type,
          payment.receipt_no // Add receipt_no
        ]);

        const paymentSql = `
          INSERT INTO payments (admission_number, course_id, amount_due, amount_paid, payment_type, receipt_no)
          VALUES ?
        `;
        db.query(paymentSql, [paymentValues], (err) => {
          if (err) return res.status(500).json({ error: "Database error (payments)" });

          res.status(200).json({ message: "Student fully registered!" });
        });
      });
    }
  );
});

module.exports = router;