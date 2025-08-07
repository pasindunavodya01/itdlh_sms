// server/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send("Student Management System Backend Running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);


const adminRoutes = require('./routes/admins');
app.use('/api/admins', adminRoutes);

const courseRoutes = require("./routes/courses");
app.use("/api/courses", courseRoutes);

const paymentRoutes = require('./routes/payment');
app.use('/api/payments', paymentRoutes);
