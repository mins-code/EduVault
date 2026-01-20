const express = require('express');
const User = require('../models/User');
const Document = require('../models/Document');

const router = express.Router();

// @route   GET /api/portfolio/:username
// @desc    Get public portfolio for a user
// @access  Public
router.get('/:username', async (req, res) => {
    try {
        const { username } = req.params;

        // Find user by username
        const user = await User.findOne({ username: username.toLowerCase() });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if portfolio is public
        if (!user.portfolioPublic) {
            return res.status(403).json({
                success: false,
                message: 'This portfolio is private'
            });
        }

        // Fetch all documents for this user
        const documents = await Document.find({ userId: user._id })
            .sort({ uploadDate: -1 });

        // Return user profile and documents
        res.status(200).json({
            success: true,
            user: {
                name: user.fullName,
                email: user.email,
                university: user.university,
                degree: user.degree,
                branch: user.branch,
                graduationYear: user.graduationYear,
                username: user.username
            },
            documents: documents
        });

    } catch (error) {
        console.error('Portfolio fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching portfolio'
        });
    }
});

module.exports = router;
