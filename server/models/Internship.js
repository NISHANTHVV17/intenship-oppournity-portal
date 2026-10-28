const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const toJSONOptions = require('./toJSON');

const internshipSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    mode: { type: String, enum: ['Remote', 'On-site', 'Hybrid'], required: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requiredSkills: { type: [String], default: [] },
    stipend: { type: Number, default: 0, min: 0 }, // 0 = unpaid
    isPaid: { type: Boolean, default: false },
    duration: { type: String, required: true },
    // Stored as "YYYY-MM-DD" text so it can be compared with today's date easily
    deadline: { type: String, required: true },
    openings: { type: Number, default: 1, min: 1 },
    postedAt: { type: Date, default: Date.now },
  },
  { toJSON: toJSONOptions() }
);

module.exports = mongoose.model('Internship', internshipSchema);
