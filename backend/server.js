// Import required packages
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('🔐 Vault Database Connected');
    })
    .catch((error) => {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1); // Exit if database connection fails
    });

// Import routes
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const portfolioRoutes = require('./routes/portfolio');
const applicationRoutes = require('./routes/applications');
const recruiterAuthRoutes = require('./routes/recruiterAuth');
const scoutRoutes = require('./routes/scout');
const analyticsRoutes = require('./routes/analytics');
const projectRoutes = require('./routes/projects');
const challengeRoutes = require('./routes/challenges');
const executeRoutes = require('./routes/execute');
const adminRoutes = require('./routes/admin');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/recruiters', recruiterAuthRoutes);
app.use('/api/scout', scoutRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/execute', executeRoutes);
app.use('/api/admin', adminRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'EduVault Server is Running' });
});

// Set port from environment variable or default to 5001
const PORT = process.env.PORT || 5001;

// Start server
app.listen(PORT, () => {
    console.log(`🚀 EduVault server running on port ${PORT}`);
});
