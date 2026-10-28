const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const toJSONOptions = require('./toJSON');

const userSchema = new mongoose.Schema(
  {
    // Our own string id (used in URLs, JWTs and references)
    id: { type: String, default: uuidv4, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    phone: { type: String, default: '' },
    college: { type: String, default: '' },
    department: { type: String, default: '' },
    year: { type: String, default: '' },
    skills: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  {
    // passwordHash is never sent to the client
    toJSON: toJSONOptions(['passwordHash']),
  }
);

module.exports = mongoose.model('User', userSchema);
