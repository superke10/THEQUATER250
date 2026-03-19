// routes/admin.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Request = require('../models/Request');
const auth = require('../middleware/auth');

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find admin
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create token
    const token = jwt.sign(
      { adminId: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      success: true, 
      token,
      admin: { username: admin.username }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all requests (protected)
router.get('/requests', auth, async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update request status (protected)
router.put('/requests/:id', auth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    );
    res.json({ success: true, request });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// WhatsApp reply simulation (protected)
router.post('/whatsapp-reply', auth, async (req, res) => {
  try {
    const { to, message, requestId } = req.body;
    
    // Here you'll integrate actual WhatsApp API
    console.log(`📱 WhatsApp reply would be sent to ${to}: "${message}"`);
    
    // Update request if ID provided
    if (requestId) {
      await Request.findByIdAndUpdate(requestId, {
        $push: { 
          notes: `[WhatsApp reply sent at ${new Date().toLocaleString()}]: ${message}` 
        }
      });
    }
    
    res.json({ 
      success: true, 
      message: 'WhatsApp message queued (simulated)',
      // In production, return actual API response
    });
    
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;