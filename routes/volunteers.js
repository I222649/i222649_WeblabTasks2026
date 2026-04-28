const express = require('express');
const router  = express.Router();
const { body, validationResult } = require('express-validator');

const Volunteer = require('../models/Volunteer');

/* ------------------------------------------------
   Validation rules
------------------------------------------------ */
const volunteerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('skills')
    .optional()
    .isArray().withMessage('Skills must be an array'),
  body('availability')
    .optional()
    .isIn(['available', 'on_task']).withMessage('Availability must be available or on_task')
];

/* ------------------------------------------------
   GET /api/volunteers
   Return all volunteers
------------------------------------------------ */
router.get('/', async (req, res) => {
  try {
    const volunteers = await Volunteer.find().populate('assignedTasks', 'title status priority');
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ------------------------------------------------
   POST /api/volunteers
   Register a new volunteer
   409 if email already exists
------------------------------------------------ */
router.post('/', volunteerValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, skills, availability } = req.body;

    // Check for duplicate email
    const existing = await Volunteer.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const volunteer = new Volunteer({
      name,
      email,
      skills: skills || [],
      availability: availability || 'available'
    });

    const saved = await volunteer.save();
    res.status(201).json(saved);
  } catch (err) {
    // Mongoose duplicate key error
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
