const Task = require('./models/Task');
const Volunteer = require('./models/Volunteer');

/**
 * Runs a single aggregation pipeline on the Task collection
 * to compute dashboard stats, plus a countDocuments on Volunteer.
 * @returns {Promise<{totalActive, totalCritical, completedToday, totalVolunteers}>}
 */
async function getStats() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const pipeline = [
    {
      $facet: {
        totalActive: [
          { $match: { status: 'active' } },
          { $count: 'count' }
        ],
        totalCritical: [
          { $match: { priority: 'critical' } },
          { $count: 'count' }
        ],
        completedToday: [
          {
            $match: {
              status: 'completed',
              createdAt: { $gte: startOfToday }
            }
          },
          { $count: 'count' }
        ]
      }
    },
    {
      $project: {
        totalActive:     { $ifNull: [{ $arrayElemAt: ['$totalActive.count',     0] }, 0] },
        totalCritical:   { $ifNull: [{ $arrayElemAt: ['$totalCritical.count',   0] }, 0] },
        completedToday:  { $ifNull: [{ $arrayElemAt: ['$completedToday.count',  0] }, 0] }
      }
    }
  ];

  const [taskStats] = await Task.aggregate(pipeline);
  const totalVolunteers = await Volunteer.countDocuments();

  return {
    totalActive:    taskStats.totalActive,
    totalCritical:  taskStats.totalCritical,
    completedToday: taskStats.completedToday,
    totalVolunteers
  };
}

module.exports = getStats;
