const express = require('express');
const router  = express.Router();
const { body, validationResult } = require('express-validator');

const Task      = require('../models/Task');
const Volunteer = require('../models/Volunteer');

/* ------------------------------------------------
   Validation rules
------------------------------------------------ */
const taskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 200 }).withMessage('Description must not exceed 200 characters'),
  body('priority')
    .notEmpty().withMessage('Priority is required')
    .isIn(['critical', 'high', 'medium']).withMessage('Priority must be critical, high, or medium'),
  body('minVolunteers')
    .optional()
    .isInt({ min: 1 }).withMessage('minVolunteers must be at least 1')
];

/* ------------------------------------------------
   GET /api/tasks
   Optional query: ?priority=critical
------------------------------------------------ */
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.priority) {
      const allowed = ['critical', 'high', 'medium'];
      if (!allowed.includes(req.query.priority)) {
        return res.status(400).json({ error: 'Invalid priority value' });
      }
      filter.priority = req.query.priority;
    }

    const tasks = await Task.find(filter)
      .populate('assignedVolunteers', 'name skills availability')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ------------------------------------------------
   POST /api/tasks
   Create a new task
------------------------------------------------ */
router.post('/', taskValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, priority, minVolunteers, requiredSkills } = req.body;

    const task = new Task({
      title,
      description,
      priority,
      minVolunteers: minVolunteers || 1,
      requiredSkills: requiredSkills || []
    });

    const saved = await task.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ------------------------------------------------
   PATCH /api/tasks/:id/status
   Advance status: pending → active → completed
   Reject any other transition with 400
------------------------------------------------ */
router.patch('/:id/status', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const transitions = { pending: 'active', active: 'completed' };

    if (!transitions[task.status]) {
      return res.status(400).json({
        error: `Cannot advance status from '${task.status}'. Task is already completed.`
      });
    }

    task.status = transitions[task.status];
    const updated = await task.save();
    res.json(updated);
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid task ID' });
    res.status(500).json({ error: err.message });
  }
});

/* ------------------------------------------------
   DELETE /api/tasks/:id
------------------------------------------------ */
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid task ID' });
    res.status(500).json({ error: err.message });
  }
});

/* ------------------------------------------------
   POST /api/tasks/:id/assign
   Assign a volunteer to a task
------------------------------------------------ */
router.post('/:id/assign', async (req, res) => {
  try {
    const { volunteerId } = req.body;

    if (!volunteerId) {
      return res.status(400).json({ error: 'volunteerId is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });

    // Volunteer must be available
    if (volunteer.availability !== 'available') {
      return res.status(400).json({ error: 'Volunteer is not available (currently on_task)' });
    }

    // Must not already be assigned to this task
    if (task.assignedVolunteers.map(id => id.toString()).includes(volunteerId)) {
      return res.status(400).json({ error: 'Volunteer is already assigned to this task' });
    }

    // Update both documents
    task.assignedVolunteers.push(volunteerId);
    volunteer.assignedTasks.push(task._id);
    volunteer.availability = 'on_task';

    await Promise.all([task.save(), volunteer.save()]);

    // Return populated task
    const populated = await Task.findById(task._id)
      .populate('assignedVolunteers', 'name skills availability');

    res.json(populated);
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid ID format' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
