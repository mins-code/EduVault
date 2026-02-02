const express = require('express')
const router = express.Router()
const Challenge = require('../models/Challenge')
const Submission = require('../models/Submission')
const auth = require('../middleware/auth')

// @route   GET /api/challenges
// @desc    Get all challenges with optional filters
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { language, difficulty, tags, search } = req.query

        // Build query
        const query = { isActive: true }

        if (language) {
            query.language = language
        }

        if (difficulty) {
            query.difficulty = difficulty
        }

        if (tags) {
            query.tags = { $in: tags.split(',') }
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { blurb: { $regex: search, $options: 'i' } }
            ]
        }

        const challenges = await Challenge.find(query)
            .select('-testCode') // Don't send test code to frontend
            .sort({ createdAt: -1 })

        res.json({
            success: true,
            count: challenges.length,
            challenges
        })
    } catch (error) {
        console.error('❌ Error fetching challenges:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch challenges',
            error: error.message
        })
    }
})

// @route   GET /api/challenges/:id
// @desc    Get single challenge by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id)
            .select('-testCode') // Don't send test code to frontend

        if (!challenge) {
            return res.status(404).json({
                success: false,
                message: 'Challenge not found'
            })
        }

        // Get user's previous submissions for this challenge
        const submissions = await Submission.find({
            userId: req.user.userId,
            challengeId: req.params.id
        })
            .select('status submittedAt executionTime')
            .sort({ submittedAt: -1 })
            .limit(5)

        res.json({
            success: true,
            challenge,
            userSubmissions: submissions
        })
    } catch (error) {
        console.error('❌ Error fetching challenge:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch challenge',
            error: error.message
        })
    }
})

// @route   POST /api/challenges
// @desc    Create new challenge (admin only)
// @access  Private (Admin)
router.post('/', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            })
        }

        const challenge = new Challenge(req.body)
        await challenge.save()

        console.log('✅ Challenge created:', challenge.slug)

        res.status(201).json({
            success: true,
            message: 'Challenge created successfully',
            challenge
        })
    } catch (error) {
        console.error('❌ Error creating challenge:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to create challenge',
            error: error.message
        })
    }
})

// @route   PUT /api/challenges/:id
// @desc    Update challenge (admin only)
// @access  Private (Admin)
router.put('/:id', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            })
        }

        const challenge = await Challenge.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )

        if (!challenge) {
            return res.status(404).json({
                success: false,
                message: 'Challenge not found'
            })
        }

        console.log('✅ Challenge updated:', challenge.slug)

        res.json({
            success: true,
            message: 'Challenge updated successfully',
            challenge
        })
    } catch (error) {
        console.error('❌ Error updating challenge:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to update challenge',
            error: error.message
        })
    }
})

// @route   DELETE /api/challenges/:id
// @desc    Delete challenge (admin only)
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            })
        }

        const challenge = await Challenge.findByIdAndDelete(req.params.id)

        if (!challenge) {
            return res.status(404).json({
                success: false,
                message: 'Challenge not found'
            })
        }

        console.log('🗑️ Challenge deleted:', challenge.slug)

        res.json({
            success: true,
            message: 'Challenge deleted successfully'
        })
    } catch (error) {
        console.error('❌ Error deleting challenge:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to delete challenge',
            error: error.message
        })
    }
})

module.exports = router
