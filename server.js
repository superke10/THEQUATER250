// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));





app.get('/test-email', async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: 'Test Email from THE QUARTER',
      text: 'If you receive this, email is working!'
    });

    res.send('Email sent successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Email failed: ' + error.message);
  }
});








// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thequarter', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
  // Create default admin if none exists
  createDefaultAdmin();
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Import routes
const requestRoutes = require('./routes/requests');
const adminRoutes = require('./routes/admin');

// Use routes with rate limiting
app.use('/api', apiLimiter, requestRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);

// Admin dashboard route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

// Function to create default admin
async function createDefaultAdmin() {
  try {
    const Admin = require('./models/Admin');
    const bcrypt = require('bcryptjs');
    
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new Admin({
        username: 'admin',
        password: hashedPassword
      });
      await admin.save();
      console.log('✅ Default admin created (username: admin, password: admin123)');
    }
  } catch (err) {
    console.error('Error creating default admin:', err);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email notifications will be sent to: ${process.env.EMAIL_TO || 'shemserck@icloud.com'}`);
});
