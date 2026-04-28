require('dotenv').config();
const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');

const taskRoutes      = require('./routes/tasks');
const volunteerRoutes = require('./routes/volunteers');
const getStats        = require('./stats.aggregate');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ================================================
   MIDDLEWARE
================================================ */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================================================
   DATABASE CONNECTION
================================================ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log(`MongoDB connected: ${process.env.MONGO_URI}`))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

/* ================================================
   ROUTES
================================================ */
app.use('/api/tasks',      taskRoutes);
app.use('/api/volunteers', volunteerRoutes);

/* ------------------------------------------------
   GET /api/stats
   Uses the aggregation function from stats.aggregate.js
------------------------------------------------ */
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================================================
   CATCH-ALL 404
================================================ */
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/* ================================================
   GLOBAL ERROR HANDLER
================================================ */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

/* ================================================
   START SERVER
================================================ */
app.listen(PORT, () => {
  console.log(`ResQLink API running on http://localhost:${PORT}`);
});
