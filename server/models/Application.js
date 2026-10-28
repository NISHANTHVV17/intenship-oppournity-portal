const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const toJSONOptions = require('./toJSON');

const applicationSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4, unique: true, index: true },
    studentId: { type: String, required: true, index: true }, // User.id
    internshipId: { type: String, required: true, index: true }, // Internship.id
    resumeUrl: { type: String, required: true },
    coverLetter: { type: String, required: true, minlength: 50, maxlength: 1000 },
    status: {
      type: String,
      enum: ['Pending', 'Shortlisted', 'Accepted', 'Rejected'],
      default: 'Pending',
    },
    adminRemark: { type: String, default: '' },
    appliedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { toJSON: toJSONOptions() }
);

// Extra safety: the database itself refuses a second application
// from the same student to the same internship.
applicationSchema.index({ studentId: 1, internshipId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
