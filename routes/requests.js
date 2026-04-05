// routes/requests.js
const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const nodemailer = require('nodemailer');

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify email connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready');
  }
});

// Submit new service request
router.post('/submit-request', async (req, res) => {
  try {
    const { fullName, email, phone, service, moreInfo } = req.body;
    
    // Validate required fields
    if (!fullName || !email || !phone || !service) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    // Create new request
    const newRequest = new Request({
      fullName,
      email,
      phone,
      service,
      notes: moreInfo || ''
    });
    
    await newRequest.save();
    console.log('✅ Request saved to database:', newRequest._id);
    
    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: `🔔 New Concierge Request: ${service}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0c1318; color: #ffffff; padding: 30px; border-left: 4px solid #c5a059;">
          <h2 style="color: #c5a059; margin-bottom: 20px;">THE QUARTER · New Request</h2>
          
          <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 10px 0;"><strong style="color: #c5a059;">Name:</strong> ${fullName}</p>
            <p style="margin: 10px 0;"><strong style="color: #c5a059;">Email:</strong> ${email}</p>
            <p style="margin: 10px 0;"><strong style="color: #c5a059;">Phone:</strong> ${phone}</p>
            <p style="margin: 10px 0;"><strong style="color: #c5a059;">Service:</strong> ${service}</p>
            ${moreInfo ? `<p style="margin: 10px 0;"><strong style="color: #c5a059;">Additional Information:</strong> ${moreInfo}</p>` : ''}
          </div>
          
          <p style="color: #a0b3bd; font-size: 14px;">Login to admin dashboard to view all requests and reply via WhatsApp.</p>
          <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(212,182,138,0.2); font-size: 12px; color: #a0b3bd;">
            THE QUARTER · Nyarutarama, Kigali · +250 788 556 176
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Email notification sent');
    
    res.status(201).json({ 
      success: true, 
      message: 'Request submitted successfully',
      requestId: newRequest._id
    });
    
  } catch (error) {
    console.error('❌ Error submitting request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error, please try again later' 
    });
  }
});

module.exports = router;