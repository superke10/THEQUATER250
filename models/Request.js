// models/Request.js
const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  service: {
    type: String,
    required: true,
    enum: [
      // Experience Rwanda
      'Gorilla trekking',
      'Lake Kivu tours',
      'Airport transfers',
      'Accommodation booking',
      'Private car service',
      'Pre-arrival provisioning',
      'Restaurant reservations',
      'Canopy walks',
      'Lake Muhazi visits',
      
      // Embrace Kigali Life
      'Grocery shopping and delivery',
      'Housekeeping',
      'Property maintenance',
      'Event planning',
      'Bespoke culinary hosting',
      'After-event cleanup',
      'Personal shopping',
      'Relocation services'
    ]
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'completed', 'archived'],
    default: 'new'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Request', requestSchema);