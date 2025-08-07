const express = require('express');
const router = express.Router();
const db = require('../db'); // Your DB connection

// Get current payment for a student and course
router.get('/current/:admissionNumber/:courseId', (req, res) => {
    const { admissionNumber, courseId } = req.params;

    const query = `
        SELECT * FROM payments 
        WHERE admission_number = ? AND course_id = ?
        ORDER BY id DESC LIMIT 1
    `;

    db.query(query, [admissionNumber, courseId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (result.length > 0) {
            res.status(200).json({ payment: result[0] });
        } else {
            res.status(200).json({ payment: null });
        }
    });
});

// Add payment for existing student
router.post('/add-for-student', (req, res) => {
    const {
        admission_number,
        course_id,
        amount_paid,
        payment_type
    } = req.body;

    // First get the current payment record for this student and course
    const getCurrentPaymentQuery = `
        SELECT * FROM payments 
        WHERE admission_number = ? AND course_id = ?
        ORDER BY id DESC LIMIT 1
    `;

    db.query(getCurrentPaymentQuery, [admission_number, course_id], (err, currentPayments) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        let currentDue = 0;
        let currentPaid = 0;

        if (currentPayments.length > 0) {
            // Use existing payment record
            currentDue = currentPayments[0].amount_due;
            currentPaid = currentPayments[0].amount_paid;
        } else {
            // Get course amount if no previous payment
            const getCourseQuery = 'SELECT amount FROM courses WHERE course_id = ?';
            db.query(getCourseQuery, [course_id], (err, courseResult) => {
                if (err || courseResult.length === 0) {
                    return res.status(500).json({ error: 'Course not found' });
                }
                currentDue = courseResult[0].amount;
            });
        }

        // Calculate new amounts
        const newPaid = currentPaid + parseFloat(amount_paid);
        const newDue = Math.max(0, currentDue - parseFloat(amount_paid));

        // Insert new payment record
        const insertQuery = `
            INSERT INTO payments 
            (admission_number, course_id, amount_due, amount_paid, payment_type) 
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(insertQuery, [admission_number, course_id, newDue, newPaid, payment_type], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(200).json({ 
                message: 'Payment added successfully',
                newDue: newDue,
                newPaid: newPaid
            });
        });
    });
});

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
