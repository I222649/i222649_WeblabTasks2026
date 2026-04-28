require('dotenv').config();
const mongoose  = require('mongoose');
const Task      = require('./models/Task');
const Volunteer = require('./models/Volunteer');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // ── Clear existing data ──────────────────────────────────────
    await Task.deleteMany({});
    await Volunteer.deleteMany({});
    console.log('Cleared existing documents');

    // ── Insert volunteers first (need their _ids for task refs) ──
    const [ahmad, sara, bilal] = await Volunteer.insertMany([
      {
        name: 'Ahmad K.',
        email: 'ahmad@resq.org',
        skills: ['First Aid', 'Logistics'],
        availability: 'available'
      },
      {
        name: 'Sara M.',
        email: 'sara@resq.org',
        skills: ['Medical', 'Search & Rescue'],
        availability: 'on_task'          // assigned to Shelter Infrastructure
      },
      {
        name: 'Bilal R.',
        email: 'bilal@resq.org',
        skills: ['Engineering', 'Logistics'],
        availability: 'available'
      }
    ]);
    console.log('Inserted 3 volunteers');

    // ── Insert tasks ─────────────────────────────────────────────
    const task1 = await Task.create({
      title: 'Medical Supply Distribution',
      description: 'Coordinate delivery of medical kits to Zone A shelters. Minimum 3 volunteers required.',
      priority: 'critical',
      status: 'pending',
      minVolunteers: 3,
      requiredSkills: ['First Aid', 'Logistics'],
      assignedVolunteers: []
    });

    // Shelter Infrastructure – already has 3 assigned volunteers
    const task2 = await Task.create({
      title: 'Shelter Infrastructure Zone B',
      description: 'Set up temporary shelters for 200 displaced families in Zone B. Engineering skills needed.',
      priority: 'high',
      status: 'active',
      minVolunteers: 5,
      requiredSkills: ['Engineering', 'Logistics'],
      assignedVolunteers: [ahmad._id, sara._id, bilal._id]
    });

    const task3 = await Task.create({
      title: 'Water Purification Unit Ops',
      description: 'Operate purification stations at locations W1, W2, W3. Daily volunteer rotation schedule.',
      priority: 'medium',
      status: 'completed',
      minVolunteers: 2,
      requiredSkills: ['Medical', 'Engineering'],
      assignedVolunteers: []
    });
    console.log('Inserted 3 tasks');

    // ── Set assignedTasks on volunteers for task2 ────────────────
    await Volunteer.findByIdAndUpdate(ahmad._id, { $push: { assignedTasks: task2._id }, availability: 'available' });
    await Volunteer.findByIdAndUpdate(sara._id,  { $push: { assignedTasks: task2._id }, availability: 'on_task'   });
    await Volunteer.findByIdAndUpdate(bilal._id, { $push: { assignedTasks: task2._id }, availability: 'available' });
    console.log('Linked assignedTasks on volunteers');

    console.log('\n✅  Seeded successfully');
  } catch (err) {
    console.error('Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
