// backend/GoalModel.js
const mongoose = require('mongoose');

// Define exactly what properties a saved Goal Sheet Row must have
const SingleGoalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  thrustArea: { type: String, required: true },
  uom: { type: String, required: true },
  target: { type: String, required: true },
  weightage: { type: Number, required: true }
});

// Wrap the individual goals inside a Master Submission Document linked to the student
const GoalSubmissionSchema = new mongoose.Schema({
  studentId: { type: String, default: "23SCSE1010681" },
  studentName: { type: String, default: "Vaibhav Chauhan" },
  submissionDate: { type: Date, default: Date.now },
  status: { type: String, default: "Pending L1 Review" },
  comments: { type: String, default: "" },
  goals: [SingleGoalSchema] // Array of validation-passed goals
});

module.exports = mongoose.model('GoalSubmission', GoalSubmissionSchema);