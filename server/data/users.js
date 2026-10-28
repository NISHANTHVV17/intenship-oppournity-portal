// Sample users. seed.js inserts these into MongoDB on the first run
// (or whenever you run "npm run seed").

const bcrypt = require('bcryptjs');
const { daysAgoISO } = require('../utils/helpers');

// Passwords are hashed with bcrypt before they are saved,
// so plain-text passwords are never stored in the database.
const users = [
  {
    id: 'u1',
    name: 'Portal Admin',
    email: 'admin@portal.com',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    phone: '9876500000',
    college: '',
    department: '',
    year: '',
    skills: [],
    createdAt: daysAgoISO(60),
  },
  {
    id: 'u2',
    name: 'Rahul Sharma',
    email: 'student@portal.com',
    passwordHash: bcrypt.hashSync('student123', 10),
    role: 'student',
    phone: '9876543210',
    college: 'ABC Institute of Technology',
    department: 'Computer Science',
    year: '3rd Year',
    skills: ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS'],
    createdAt: daysAgoISO(30),
  },
  {
    id: 'u3',
    name: 'Priya Patel',
    email: 'priya@portal.com',
    passwordHash: bcrypt.hashSync('student123', 10),
    role: 'student',
    phone: '9123456780',
    college: 'XYZ College of Engineering',
    department: 'Information Technology',
    year: '4th Year',
    skills: ['Python', 'Machine Learning', 'SQL', 'Figma'],
    createdAt: daysAgoISO(25),
  },
];

module.exports = users;
