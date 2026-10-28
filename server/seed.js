// Loads the sample data from server/data/ into MongoDB.
//
// - When the server starts, sample data is inserted automatically
//   ONLY if the database has no users yet (first run).
// - Run "npm run seed" to wipe everything and reload the sample data.

const User = require('./models/User');
const Internship = require('./models/Internship');
const Application = require('./models/Application');

const sampleUsers = require('./data/users');
const sampleInternships = require('./data/internships');
const sampleApplications = require('./data/applications');

/**
 * @param {boolean} reset - true = delete all existing data first
 */
async function seedDatabase(reset = false) {
  if (reset) {
    await Promise.all([User.deleteMany({}), Internship.deleteMany({}), Application.deleteMany({})]);
    console.log('Existing data deleted.');
  } else {
    const userCount = await User.countDocuments();
    if (userCount > 0) return; // database already has data – do nothing
  }

  await User.insertMany(sampleUsers);
  await Internship.insertMany(sampleInternships);
  await Application.insertMany(sampleApplications);
  console.log(
    `Sample data inserted: ${sampleUsers.length} users, ${sampleInternships.length} internships, ${sampleApplications.length} applications.`
  );
}

// Allows running this file directly: "node seed.js" (used by "npm run seed")
if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  const connectDB = require('./config/db');

  connectDB()
    .then(() => seedDatabase(true))
    .then(() => console.log('Seeding complete.'))
    .catch((error) => {
      console.error('Seeding failed:', error.message);
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
}

module.exports = seedDatabase;
