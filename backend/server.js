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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/applications', applicationRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'EduVault Server is Running' });
});

// Set port from environment variable or default to 5000
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`🚀 EduVault server running on port ${PORT}`);
});
