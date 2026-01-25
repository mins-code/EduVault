const express = require('express');
const User = require('../models/User');
const Recruiter = require('../models/Recruiter');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to authenticate recruiter
const authenticateRecruiter = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== 'recruiter') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Recruiter role required.',
            });
        }

        req.recruiterId = decoded.recruiterId;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
};

// @route   GET /api/scout/search
// @desc    Search for students with filters
// @access  Public (but only returns public portfolios)
router.get('/search', async (req, res) => {
    try {
        const { skill, university, degree, graduationYear, branch } = req.query;

        // Build query object
        const query = {
            portfolioPublic: true, // Privacy check - only public portfolios
        };

        // Add filters if provided
        if (skill) {
            // Case-insensitive partial match for skills
            query.skills = { $regex: skill, $options: 'i' };
        }

        if (university) {
            // Case-insensitive partial match for university
            query.university = { $regex: university, $options: 'i' };
        }

        if (degree) {
            // Case-insensitive partial match for degree
            query.degree = { $regex: degree, $options: 'i' };
        }

        if (branch) {
            // Case-insensitive partial match for branch
            query.branch = { $regex: branch, $options: 'i' };
        }

        if (graduationYear) {
            // Exact match for graduation year
            query.graduationYear = parseInt(graduationYear);
        }

        // Execute search with selected fields only
        const students = await User.find(query).select(
            '_id fullName email username university degree branch graduationYear skills bio'
        );

        res.status(200).json({
            success: true,
            count: students.length,
            students,
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during search',
        });
    }
});

// @route   POST /api/scout/bookmark/:studentId
// @desc    Bookmark a student profile
// @access  Private (Recruiter only)
router.post('/bookmark/:studentId', authenticateRecruiter, async (req, res) => {
    try {
        const { studentId } = req.params;

        // Check if student exists and has public portfolio
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found',
            });
        }

        if (!student.portfolioPublic) {
            return res.status(403).json({
                success: false,
                message: 'Cannot bookmark a private portfolio',
            });
        }

        // Find recruiter and add bookmark
        const recruiter = await Recruiter.findById(req.recruiterId);

        // Check if already bookmarked
        if (recruiter.bookmarks.includes(studentId)) {
            return res.status(400).json({
                success: false,
                message: 'Student already bookmarked',
            });
        }

        // Add to bookmarks
        recruiter.bookmarks.push(studentId);
        await recruiter.save();

        res.status(200).json({
            success: true,
            message: 'Student bookmarked successfully',
            bookmarks: recruiter.bookmarks,
        });
    } catch (error) {
        console.error('Bookmark error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while bookmarking',
        });
    }
});

// @route   DELETE /api/scout/bookmark/:studentId
// @desc    Remove bookmark
// @access  Private (Recruiter only)
router.delete('/bookmark/:studentId', authenticateRecruiter, async (req, res) => {
    try {
        const { studentId } = req.params;

        // Find recruiter and remove bookmark
        const recruiter = await Recruiter.findById(req.recruiterId);

        // Check if bookmarked
        if (!recruiter.bookmarks.includes(studentId)) {
            return res.status(400).json({
                success: false,
                message: 'Student not in bookmarks',
            });
        }

        // Remove from bookmarks
        recruiter.bookmarks = recruiter.bookmarks.filter(
            (id) => id.toString() !== studentId
        );
        await recruiter.save();

        res.status(200).json({
            success: true,
            message: 'Bookmark removed successfully',
            bookmarks: recruiter.bookmarks,
        });
    } catch (error) {
        console.error('Remove bookmark error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while removing bookmark',
        });
    }
});

// @route   GET /api/scout/bookmarks
// @desc    Get all bookmarked students
// @access  Private (Recruiter only)
router.get('/bookmarks', authenticateRecruiter, async (req, res) => {
    try {
        // Find recruiter and populate bookmarks
        const recruiter = await Recruiter.findById(req.recruiterId).populate(
            'bookmarks',
            '_id fullName email university degree branch graduationYear skills bio'
        );

        res.status(200).json({
            success: true,
            count: recruiter.bookmarks.length,
            bookmarks: recruiter.bookmarks,
        });
    } catch (error) {
        console.error('Get bookmarks error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching bookmarks',
        });
    }
});

module.exports = router;
