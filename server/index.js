const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send("Student Management System Backend Running!");
});

// Routes
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const adminRoutes = require('./routes/admins');
app.use('/api/admins', adminRoutes);

const paymentRoutes = require('./routes/payment');
app.use('/api/payments', paymentRoutes);

const courseRoutes = require('./routes/courses');
app.use('/api/courses', courseRoutes);

const registrationRoutes = require('./routes/registration');
app.use('/api/registration', registrationRoutes);

const studentRoutes = require('./routes/studentRoutes');
app.use('/api/students', studentRoutes);

const attendanceRoutes = require('./routes/attendance');
app.use('/api/attendance', attendanceRoutes);

const eligibilityRoutes = require('./routes/eligibility');
app.use('/api/eligibility', eligibilityRoutes);

const marksRoutes = require('./routes/marks');
app.use('/api/marks', marksRoutes);

const chatbotRoutes = require('./routes/chatbot'); // <-- new
app.use('/api/chatbot', chatbotRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
