const express = require('express');
const User = require('../models/User');
const Document = require('../models/Document');
const cloudinary = require('../config/cloudinary');

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

        // Fetch only PUBLIC documents for this user's portfolio
        const documents = await Document.find({
            userId: user._id,
            isPublic: true  // Only show documents marked as public
        }).sort({ uploadDate: -1 });

        console.log(`📊 Portfolio for ${username}: ${documents.length} public documents`);

        // Return user profile and documents (without direct URLs for security)
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
            documents: documents.map(doc => ({
                _id: doc._id,
                originalName: doc.originalName,
                category: doc.category,
                fileSize: doc.fileSize,
                uploadDate: doc.uploadDate,
                hasCloudStorage: !!doc.cloudinaryPublicId,
                isPublic: doc.isPublic
            }))
        });

    } catch (error) {
        console.error('Portfolio fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching portfolio'
        });
    }
});

// @route   GET /api/portfolio/:username/document/:docId
// @desc    Generate secure guest pass for portfolio document viewing
// @access  Public (but generates time-limited signed URL)
router.get('/:username/document/:docId', async (req, res) => {
    try {
        const { username, docId } = req.params;
        console.log('🎟️  Guest pass request for portfolio document:', docId);

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

        // Find document and verify it belongs to this user
        const document = await Document.findById(docId);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        if (document.userId.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Document does not belong to this portfolio'
            });
        }

        if (!document.cloudinaryPublicId) {
            return res.status(400).json({
                success: false,
                message: 'Document not available for secure viewing'
            });
        }

        // Generate 10-minute guest pass (signed URL)
        const fileExt = document.originalName.split('.').pop().toLowerCase();
        const expiresAt = Math.floor(Date.now() / 1000) + (10 * 60);

        const guestPassUrl = cloudinary.utils.private_download_url(
            document.cloudinaryPublicId,
            fileExt,
            {
                resource_type: 'image',
                expires_at: expiresAt,
                attachment: false
            }
        );

        console.log('✅ Generated guest pass (expires in 10 min)');

        res.json({
            success: true,
            guestPassUrl: guestPassUrl,
            fileName: document.originalName,
            expiresIn: '10 minutes',
            expiresAt: expiresAt
        });

    } catch (error) {
        console.error('Portfolio document view error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating secure document link'
        });
    }
});

module.exports = router;

