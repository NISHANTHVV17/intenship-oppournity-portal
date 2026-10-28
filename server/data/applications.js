// 4 sample applications (inserted into MongoDB by seed.js),
// one in each status so every badge colour can be seen in the demo.

const { daysAgoISO } = require('../utils/helpers');

const applications = [
  {
    id: 'a1',
    studentId: 'u2', // Rahul Sharma
    internshipId: 'i1', // Frontend Developer Intern
    resumeUrl: 'https://drive.google.com/file/d/rahul-resume/view',
    coverLetter:
      'I am a third-year Computer Science student who has built several React projects, including a college event website. I would love to grow my frontend skills with your team.',
    status: 'Pending',
    adminRemark: '',
    appliedAt: daysAgoISO(1),
    updatedAt: daysAgoISO(1),
  },
  {
    id: 'a2',
    studentId: 'u2', // Rahul Sharma
    internshipId: 'i2', // Backend Developer Intern
    resumeUrl: 'https://drive.google.com/file/d/rahul-resume/view',
    coverLetter:
      'I have experience building REST APIs with Node.js and Express for my mini projects. I am eager to learn how production backends are designed and maintained.',
    status: 'Shortlisted',
    adminRemark: 'Good profile. Interview will be scheduled next week.',
    appliedAt: daysAgoISO(2),
    updatedAt: daysAgoISO(1),
  },
  {
    id: 'a3',
    studentId: 'u3', // Priya Patel
    internshipId: 'i4', // Data Science Intern
    resumeUrl: 'https://drive.google.com/file/d/priya-resume/view',
    coverLetter:
      'As a final-year IT student, I have completed courses in Python, SQL and machine learning, and I built a sales forecasting project using Pandas. I am excited to apply my skills.',
    status: 'Accepted',
    adminRemark: 'Congratulations! Offer letter will be emailed to you.',
    appliedAt: daysAgoISO(3),
    updatedAt: daysAgoISO(1),
  },
  {
    id: 'a4',
    studentId: 'u3', // Priya Patel
    internshipId: 'i3', // Software Development Intern
    resumeUrl: 'https://drive.google.com/file/d/priya-resume/view',
    coverLetter:
      'I am interested in software development and have basic knowledge of Java and object-oriented programming. I am a quick learner and enjoy solving problems.',
    status: 'Rejected',
    adminRemark: 'We were looking for stronger Java experience. Keep learning!',
    appliedAt: daysAgoISO(4),
    updatedAt: daysAgoISO(2),
  },
];

module.exports = applications;
