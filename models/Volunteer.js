const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },
  skills: {
    type: [String],
    default: []
  },
  availability: {
    type: String,
    enum: {
      values: ['available', 'on_task'],
      message: 'Availability must be available or on_task'
    },
    default: 'available'
  },
  assignedTasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }
  ]
});

module.exports = mongoose.model('Volunteer', VolunteerSchema);
