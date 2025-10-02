const express = require("express");
const router = express.Router();
const db = require("../db");
const admin = require("../firebase/admin"); // Your Firebase admin SDK

router.post("/full-register", async (req, res) => {
  const { student, courses, payments, password } = req.body;

  console.log("📩 Incoming Full Register Request");
  console.log("Student Data:", student);
  console.log("Courses Data:", courses);
  console.log("Payments Data:", payments);

  // 1. Register user in Firebase Auth
  let firebaseUser;
  try {
    firebaseUser = await admin.auth().createUser({
      email: student.email,
      password: password,
      displayName: student.name,
    });
    console.log("✅ Firebase user created:", firebaseUser.uid);
  } catch (err) {
    console.error("❌ Firebase registration failed:", err);
    return res.status(500).json({ 
      error: "Firebase registration failed", 
      details: err.message 
    });
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
      if (err) {
        console.error("❌ Database error (users):", err);
        return res.status(500).json({ error: "Database error (users)", details: err.message });
      }
      console.log("✅ Student inserted into users table");

      // 3. Store courses in student_courses table
      const courseValues = courses.map((c) => [
        student.admission_number,
        c.course_id,
        c.class_id,
      ]);

      console.log("Course values to insert:", courseValues);

      if (courseValues.length === 0) {
        console.warn("⚠️ No courses provided for this student");
      }

      const courseSql = `INSERT INTO student_courses (admission_number, course_id, class_id) VALUES ?`;

      db.query(courseSql, [courseValues], (err) => {
        if (err) {
          console.error("❌ Database error (student_courses):", err);
          return res.status(500).json({ error: "Database error (student_courses)", details: err.message });
        }
        console.log("✅ Courses inserted into student_courses table");

        // 4. Store payments in payments table
        const paymentValues = payments.map((payment) => [
          student.admission_number,
          payment.course_id,
          payment.amount_due,
          payment.amount_paid,
          payment.payment_type,
          payment.receipt_no || null, // fallback if missing
        ]);

        console.log("Payment values to insert:", paymentValues);

        if (paymentValues.length === 0) {
          console.warn("⚠️ No payments provided for this student");
        }

        const paymentSql = `
          INSERT INTO payments (admission_number, course_id, amount_due, amount_paid, payment_type, receipt_no)
          VALUES ?
        `;

        db.query(paymentSql, [paymentValues], (err) => {
          if (err) {
            console.error("❌ Database error (payments):", err);
            return res.status(500).json({ error: "Database error (payments)", details: err.message });
          }
          console.log("✅ Payments inserted into payments table");

          res.status(200).json({ message: "🎉 Student fully registered!" });
        });
      });
    }
  );
});

module.exports = router;
