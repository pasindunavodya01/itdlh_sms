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

// Bulk add payments
router.post('/bulk-add', (req, res) => {
    const { payments } = req.body;
    if (!Array.isArray(payments) || payments.length === 0) {
        return res.status(400).json({ error: 'No payments provided' });
    }

    const query = `
        INSERT INTO payments 
        (admission_number, course_id, amount_due, amount_paid, payment_type)
        VALUES ?
    `;

    const values = payments.map(p => [
        p.admission_number,
        p.course_id,
        p.amount_due,
        p.amount_paid,
        p.payment_type
    ]);

    db.query(query, [values], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({ message: 'Payments added successfully' });
    });
});

module.exports = router;
