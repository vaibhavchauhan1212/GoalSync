// backend/index.js
const express = require('express');
const cors = require('cors');
const { validateGoalSheet } = require('./validateGoals'); // Import our validation engine
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configuration
app.use(cors());
app.use(express.json());

// 1. Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: "success", message: "GoalSync Backend Server is running smoothly!" });
});

// 2. Goal Submission Route (Protected by our validation rules) [cite: 11]
app.post('/api/goals/submit', validateGoalSheet, (req, res) => {
    // If the data reaches here, it means it successfully passed all the BRD rules! [cite: 16]
    const { goals } = req.body;

    // Simulate saving to a database for now
    res.json({
        status: "success",
        message: "Goal Sheet validation passed successfully! Document locked for manager review.", // [cite: 20]
        submittedCount: goals.length
    });
});

// Start listening for requests
app.listen(PORT, () => {
    console.log(`Server is officially running on port ${PORT}`);
});