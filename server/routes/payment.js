const express = require('express');
const router = express.Router();
const db = require('../db'); // Your DB connection

// Add new payment
router.post('/add', (req, res) => {
    const {
        admission_number,
        course_id,
        amount_due,
        amount_paid,
        payment_type
    } = req.body;

    const query = `
        INSERT INTO payments 
        (admission_number, course_id, amount_due, amount_paid, payment_type) 
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [admission_number, course_id, amount_due, amount_paid, payment_type], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({ message: 'Payment added successfully' });
    });
});

module.exports = router;
