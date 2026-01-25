const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Recruiter = require('../models/Recruiter');

const router = express.Router();

// @route   POST /api/recruiters/register
// @desc    Register a new recruiter
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password, companyName, website } = req.body;

        // Validate required fields
        if (!fullName || !email || !password || !companyName) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields (fullName, email, password, companyName)',
            });
        }

        // Check if recruiter already exists
        const existingRecruiter = await Recruiter.findOne({ email: email.toLowerCase() });
        if (existingRecruiter) {
            return res.status(400).json({
                success: false,
                message: 'A recruiter account already exists with this email',
            });
        }

        // Hash password using bcryptjs
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new recruiter
        const newRecruiter = new Recruiter({
            fullName,
            email: email.toLowerCase(),
            password: hashedPassword,
            companyName,
            website: website || '',
        });

        // Save recruiter to database
        await newRecruiter.save();

        // Generate JWT token with recruiter role
        const token = jwt.sign(
            {
                recruiterId: newRecruiter._id,
                email: newRecruiter.email,
                role: 'recruiter',
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // Token expires in 7 days
        );

        // Send success response
        res.status(201).json({
            success: true,
            message: 'Recruiter account created successfully',
            token,
            recruiter: {
                id: newRecruiter._id,
                fullName: newRecruiter.fullName,
                email: newRecruiter.email,
                companyName: newRecruiter.companyName,
                website: newRecruiter.website,
                role: 'recruiter',
            },
        });
    } catch (error) {
        console.error('Recruiter registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
        });
    }
});

// @route   POST /api/recruiters/login
// @desc    Login recruiter
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        // Check if recruiter exists
        const recruiter = await Recruiter.findOne({ email: email.toLowerCase() });
        if (!recruiter) {
            return res.status(401).json({
                success: false,
                message: 'No recruiter account found with this email. Please sign up first.',
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, recruiter.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Generate JWT token with recruiter role
        const token = jwt.sign(
            {
                recruiterId: recruiter._id,
                email: recruiter.email,
                role: 'recruiter',
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Send success response
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            recruiter: {
                id: recruiter._id,
                fullName: recruiter.fullName,
                email: recruiter.email,
                companyName: recruiter.companyName,
                website: recruiter.website,
                role: 'recruiter',
            },
        });
    } catch (error) {
        console.error('Recruiter login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
        });
    }
});

module.exports = router;
