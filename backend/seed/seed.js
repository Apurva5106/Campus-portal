// Seeds the database with:
//  - 5 gamified Levels (Aptitude, DSA, Programming, Resume, Interview) + sample questions
//  - 1 default Admin account (using ADMIN_SECRET_KEY-protected creation logic bypassed here
//    since this is a trusted server-side script)
//  - A couple of sample PlacedStudent records
//
// Run with: npm run seed   (make sure .env is configured first)
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Level = require('../models/Level');
const User = require('../models/User');
const PlacedStudent = require('../models/PlacedStudent');

const levels = [
  {
    key: 'aptitude',
    title: 'Aptitude',
    description: 'Quantitative & logical reasoning fundamentals',
    order: 1,
    passingScore: 60,
    questions: [
      { questionText: 'What is 15% of 200?', options: ['20', '30', '25', '35'], correctOptionIndex: 1, points: 10 },
      { questionText: 'If a train covers 60 km in 1 hour, its speed is?', options: ['60 km/h', '30 km/h', '120 km/h', '6 km/h'], correctOptionIndex: 0, points: 10 },
      { questionText: 'Find the next number: 2, 4, 8, 16, ?', options: ['18', '24', '32', '20'], correctOptionIndex: 2, points: 10 },
    ],
  },
  {
    key: 'dsa',
    title: 'Data Structures & Algorithms',
    description: 'Core DSA concepts asked in placement interviews',
    order: 2,
    passingScore: 60,
    questions: [
      { questionText: 'Which data structure uses FIFO order?', options: ['Stack', 'Queue', 'Tree', 'Graph'], correctOptionIndex: 1, points: 10 },
      { questionText: 'Time complexity of binary search is?', options: ['O(n)', 'O(log n)', 'O(n^2)', 'O(1)'], correctOptionIndex: 1, points: 10 },
      { questionText: 'Which sorting algorithm has the best average time complexity?', options: ['Bubble Sort', 'Selection Sort', 'Merge Sort', 'Insertion Sort'], correctOptionIndex: 2, points: 10 },
    ],
  },
  {
    key: 'programming',
    title: 'Programming Fundamentals',
    description: 'General programming & language concepts',
    order: 3,
    passingScore: 60,
    questions: [
      { questionText: 'Which keyword declares a constant in JavaScript?', options: ['var', 'let', 'const', 'static'], correctOptionIndex: 2, points: 10 },
      { questionText: 'What does OOP stand for?', options: ['Object Oriented Programming', 'Ordered Output Process', 'Open Operation Protocol', 'None'], correctOptionIndex: 0, points: 10 },
      { questionText: 'Which of these is NOT a JavaScript data type?', options: ['String', 'Boolean', 'Float', 'Number'], correctOptionIndex: 2, points: 10 },
    ],
  },
  {
    key: 'resume',
    title: 'Resume Building',
    description: 'Best practices for writing an effective resume',
    order: 4,
    passingScore: 60,
    questions: [
      { questionText: 'A resume should ideally be how many pages for a fresher?', options: ['3-4 pages', '1 page', '5+ pages', 'No limit'], correctOptionIndex: 1, points: 10 },
      { questionText: 'Which section is most important to tailor per job application?', options: ['Hobbies', 'Skills & Projects', 'Date of birth', 'Font style'], correctOptionIndex: 1, points: 10 },
    ],
  },
  {
    key: 'interview',
    title: 'Interview Preparation',
    description: 'HR & technical interview readiness',
    order: 5,
    passingScore: 60,
    questions: [
      { questionText: 'What is the best way to answer "Tell me about yourself"?', options: ['Read your resume line by line', 'Give a concise professional summary', 'Talk only about hobbies', 'Avoid answering'], correctOptionIndex: 1, points: 10 },
      { questionText: 'STAR technique in interviews stands for?', options: ['Situation, Task, Action, Result', 'Skill, Talent, Ability, Reward', 'Start, Talk, Answer, Reflect', 'None'], correctOptionIndex: 0, points: 10 },
    ],
  },
];

const runSeed = async () => {
  await connectDB();

  console.log('Seeding levels...');
  for (const lvl of levels) {
    await Level.findOneAndUpdate({ key: lvl.key }, lvl, { upsert: true, new: true, setDefaultsOnInsert: true });
  }

  console.log('Seeding default admin...');
  const adminEmail = 'admin@campusplacement.com';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: 'Platform Admin',
      email: adminEmail,
      password: 'Admin@12345', // CHANGE THIS after first login
      role: 'admin',
    });
    console.log(`Default admin created -> email: ${adminEmail} / password: Admin@12345`);
    console.log('Remember: admin login also requires ADMIN_SECRET_KEY from your .env file.');
  } else {
    console.log('Admin already exists, skipping.');
  }

  console.log('Seeding sample placement history...');
  const sampleCount = await PlacedStudent.countDocuments();
  if (sampleCount === 0) {
    await PlacedStudent.insertMany([
      {
        studentName: 'Rahul Sharma',
        college: 'ABC Institute of Technology',
        branch: 'Computer Science',
        graduationYear: 2025,
        companyName: 'TCS',
        role: 'Software Engineer',
        package: '7 LPA',
        linkedin: 'https://linkedin.com/in/rahul-sharma-example',
        placementYear: 2025,
      },
      {
        studentName: 'Priya Verma',
        college: 'ABC Institute of Technology',
        branch: 'Information Technology',
        graduationYear: 2025,
        companyName: 'Infosys',
        role: 'Systems Engineer',
        package: '6.5 LPA',
        linkedin: 'https://linkedin.com/in/priya-verma-example',
        placementYear: 2025,
      },
    ]);
  }

  console.log('Seeding complete.');
  await mongoose.connection.close();
  process.exit(0);
};

runSeed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
