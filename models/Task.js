const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    minlength: [5, 'Title must be at least 5 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [200, 'Description must not exceed 200 characters']
  },
  priority: {
    type: String,
    enum: {
      values: ['critical', 'high', 'medium'],
      message: 'Priority must be critical, high, or medium'
    },
    required: [true, 'Priority is required']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'active', 'completed'],
      message: 'Status must be pending, active, or completed'
    },
    default: 'pending'
  },
  minVolunteers: {
    type: Number,
    min: [1, 'Minimum volunteers must be at least 1'],
    default: 1
  },
  requiredSkills: {
    type: [String],
    default: []
  },
  assignedVolunteers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Volunteer'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Task', TaskSchema);
