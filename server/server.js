// Entry point of the backend.
// Loads environment variables, sets up middleware, mounts routes
// and starts the Express server.

// Load variables from server/.env BEFORE anything else reads process.env
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const internshipRoutes = require('./routes/internshipRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const connectDB = require('./config/db');
const seedDatabase = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not set. Using a default secret (OK for demo only).');
  console.warn('         Copy server/.env.example to server/.env to fix this.');
}

// ----- Middleware -----
// Allow the React frontend to call this API from another port
app.use(
  cors({
    origin: [CLIENT_URL, 'http://127.0.0.1:5173'],
  })
);
// Parse JSON request bodies into req.body
app.use(express.json());

// ----- Routes -----
// Simple health check: open http://localhost:5000/api in the browser
app.get('/api', (req, res) => {
  res.json({ message: 'Internship Portal API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);

// ----- Error handling (must be AFTER the routes) -----
app.use(notFound);
app.use(errorHandler);

// ----- Start server -----
// 1. Connect to MongoDB  2. Insert sample data on the first run  3. Listen
async function startServer() {
  try {
    await connectDB();
    await seedDatabase();
  } catch (error) {
    console.error('Could not connect to MongoDB:', error.message);
    console.error('Check MONGO_URI in server/.env and that your IP is allowed in MongoDB Atlas (Network Access).');
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/api`);
  });

  // Friendly message if the port is already being used
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the other process or change PORT in server/.env`);
    } else {
      console.error('Server error:', error);
    }
    process.exit(1);
  });
}

startServer();
