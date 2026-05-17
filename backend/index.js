// backend/index.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Required for password encryption
const jwt = require('jsonwebtoken'); // Required for secure digital signature token generation
require('dotenv').config();

const validateGoals = require('./validateGoals');
const GoalSubmission = require('./GoalModel'); // Import our new cloud schema

const app = express();
const PORT = 5000;

// Secret key for signing digital token fingerprints (keep this secure!)
const JWT_SECRET = "GOALSYNC_SUPER_SECRET_KEY_2026";

app.use(cors());
app.use(express.json());

// 1. Establish Secure Connection to Cloud MongoDB Atlas Engine
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🎰 Successfully connected to MongoDB Atlas Cloud Database!"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 📑 User Authentication Schema & Model Creation
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  role: { type: String, required: true, enum: ['Employee', 'Manager', 'Admin'] },
  name: { type: String, required: true },
  employeeId: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: "success", message: "GoalSync Backend Server is running smoothly!" });
});

// 2. Updated Submission Route that writes to the Cloud DB
app.post('/api/goals/submit', validateGoals, async (req, res) => {
  try {
    const { goals } = req.body;

    // Save the incoming payload straight into your cloud cluster database collections
    const newSubmission = new GoalSubmission({ goals });
    await newSubmission.save();

    res.status(200).json({
      status: "success",
      message: "Goal Sheet validation passed successfully! Document permanently written to MongoDB cloud and locked for manager review."
    });
  } catch (error) {
    console.error("Database Save Error:", error);
    res.status(500).json({ status: "error", message: "Failed to write data to cloud database." });
  }
});

// 3. New Fetch Route for Managers/Admins to pull latest submissions from MongoDB
app.get('/api/goals/latest', async (req, res) => {
  try {
    // Find the single most recent submission document in the collection
    const latestSubmission = await GoalSubmission.findOne().sort({ submissionDate: -1 });
    
    if (!latestSubmission) {
      return res.status(404).json({ status: "error", message: "No goal submissions found in the database." });
    }
    
    res.status(200).json({ status: "success", data: latestSubmission });
  } catch (error) {
    console.error("Database Fetch Error:", error);
    res.status(500).json({ status: "error", message: "Failed to read data from cloud database." });
  }
});

// 4. Update Status Route for Manager Approvals
app.post('/api/goals/approve', async (req, res) => {
  try {
    // Find the latest goal sheet submission and upgrade its lifecycle status
    const updated = await GoalSubmission.findOneAndUpdate(
      {}, 
      { $set: { status: "Approved", comments: "Goal profile reviewed and finalized by L1 Manager." } },
      { sort: { submissionDate: -1 }, new: true }
    );

    res.status(200).json({
      status: "success",
      message: "Goal sheet status updated to 'Approved' successfully in MongoDB Atlas!"
    });
  } catch (error) {
    console.error("Database Update Error:", error);
    res.status(500).json({ status: "error", message: "Failed to update status in cloud database." });
  }
});

// 5. Analytics Route for Admin/HR View Dashboard Counters
app.get('/api/admin/stats', async (req, res) => {
  try {
    // Run database counting queries concurrently for maximum efficiency
    const [totalSubmissions, approvedCount, pendingCount] = await Promise.all([
      GoalSubmission.countDocuments({}),
      GoalSubmission.countDocuments({ status: "Approved" }),
      GoalSubmission.countDocuments({ status: "Pending L1 Review" })
    ]);

    res.status(200).json({
      status: "success",
      data: {
        totalEligible: 1240, // Keeping global headcount placeholder
        submitted: totalSubmissions,
        approved: approvedCount,
        pending: pendingCount
      }
    });
  } catch (error) {
    console.error("Admin Analytics Fetch Error:", error);
    res.status(500).json({ status: "error", message: "Failed to compile system telemetry." });
  }
});

// 🔐 Auth Route A: Secure User Login & Token Issuance
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Check if the user account exists in MongoDB Atlas
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ status: "error", message: "Invalid username or password credentials." });
    }

    // 2. Validate the incoming text against the encrypted database hash string
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: "error", message: "Invalid username or password credentials." });
    }

    // 3. Issue a secure, tamper-proof JSON Web Token (JWT)
    const token = jwt.sign(
      { userId: user._id, role: user.role, username: user.username },
      JWT_SECRET,
      { expiresIn: '2h' } // Token auto-expires in 2 hours for security compliance
    );

    // 4. Return the token along with the user's personal context data profile
    res.status(200).json({
      status: "success",
      message: "Authentication successful!",
      token,
      user: {
        name: user.name,
        role: user.role,
        employeeId: user.employeeId
      }
    });
  } catch (error) {
    console.error("Login Engine Error:", error);
    res.status(500).json({ status: "error", message: "Server login operation failed." });
  }
});

// 🚨 TEMPORARY SYSTEM SEEDER: Run once to populate local user credentials
app.get('/api/auth/seed', async (req, res) => {
  try {
    // Wipe out any existing users so we don't duplicate keys
    await User.deleteMany({});

    const usersToCreate = [
      { username: 'vaibhav', password: 'password123', role: 'Employee', name: 'Vaibhav Chauhan', employeeId: '23SCSE1010681' },
      { username: 'manager1', password: 'password123', role: 'Manager', name: 'Sandeep Bhatia', employeeId: 'MGR-99210' },
      { username: 'hr_admin', password: 'password123', role: 'Admin', name: 'Anupama Sharma', employeeId: 'HR-00102' }
    ];

    for (let u of usersToCreate) {
      const hashed = await bcrypt.hash(u.password, 10);
      await new User({ ...u, password: hashed }).save();
    }

    res.send("🌱 Database successfully seeded with test profiles! You can now log in with username 'vaibhav', 'manager1', or 'hr_admin' using password 'password123'.");
  } catch (err) {
    res.status(500).send("Seeding failed: " + err.message);
  }
});


app.listen(PORT || 5000, '0.0.0.0', () => {
    console.log(`Backend server successfully listening on network port ${PORT || 5000}`);
});