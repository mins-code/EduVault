const express = require('express')
const router = express.Router()
const Challenge = require('../models/Challenge')
const Submission = require('../models/Submission')
const User = require('../models/User')
const auth = require('../middleware/auth')
const judge0Service = require('../services/judge0Service')

// @route   POST /api/execute
// @desc    Execute code against test cases using Judge0
// @access  Private
router.post('/', auth, async (req, res) => {
    // Legacy Judge0 route - keeping for reference but deprecated
    res.status(410).json({ message: 'Use /submit for client-side execution results' })
})

// @route   POST /api/execute/submit
// @desc    Submit results from client-side execution
// @access  Private
router.post('/submit', auth, async (req, res) => {
    try {
        const { challengeId, code, language, results, passed, executionTime } = req.body

        // Validate
        if (!challengeId || !code) {
            return res.status(400).json({ success: false, message: 'Missing fields' })
        }

        let challenge
        // Try finding by slug first
        if (challengeId) {
            challenge = await Challenge.findOne({ slug: challengeId })

            // If not found by slug, and it looks like a Mongo ID, try ID
            if (!challenge && challengeId.match(/^[0-9a-fA-F]{24}$/)) {
                challenge = await Challenge.findById(challengeId)
            }
        }

        if (!challenge) {
            return res.status(404).json({ success: false, message: 'Challenge not found' })
        }

        // Create submission
        const submission = new Submission({
            userId: req.user.userId,
            challengeId: challenge._id,
            code,
            language,
            status: passed ? 'Passed' : 'Failed',
            testResults: results,
            executionTime: executionTime || 0,
            submittedAt: new Date()
        })

        // Award badge if passed
        let badgeAwarded = false
        if (passed) {
            // Check existing badge
            const user = await User.findById(req.user.userId)
            const existingBadge = user.challengeBadges.find(
                b => b.challengeId.toString() === challenge._id.toString()
            )

            if (!existingBadge) {
                submission.badgeAwarded = true
                submission.badgeAwardedAt = new Date()

                user.challengeBadges.push({
                    challengeId: challenge._id,
                    submissionId: submission._id
                })
                await user.save()
                badgeAwarded = true
            }
        }

        await submission.save()

        // Update stats
        await challenge.recordAttempt(passed)

        res.json({
            success: true,
            submission,
            badgeAwarded
        })

    } catch (error) {
        console.error('❌ Submission error:', error)
        res.status(500).json({ success: false, message: 'Submission failed' })
    }
})

// @route   GET /api/execute/submissions
// @desc    Get user's submissions
// @access  Private
router.get('/submissions', auth, async (req, res) => {
    try {
        const { challengeId, status, limit = 20 } = req.query

        const query = { userId: req.user.userId }

        if (challengeId) {
            query.challengeId = challengeId
        }

        if (status) {
            query.status = status
        }

        const submissions = await Submission.find(query)
            .populate('challengeId', 'title slug difficulty')
            .sort({ submittedAt: -1 })
            .limit(parseInt(limit))

        res.json({
            success: true,
            count: submissions.length,
            submissions
        })
    } catch (error) {
        console.error('❌ Error fetching submissions:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch submissions',
            error: error.message
        })
    }
})

// @route   GET /api/execute/submissions/:id
// @desc    Get specific submission
// @access  Private
router.get('/submissions/:id', auth, async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate('challengeId', 'title slug difficulty description')

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            })
        }

        // Verify user owns this submission
        if (submission.userId.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            })
        }

        res.json({
            success: true,
            submission
        })
    } catch (error) {
        console.error('❌ Error fetching submission:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch submission',
            error: error.message
        })
    }
})

// @route   GET /api/execute/stats
// @desc    Get user's challenge statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
    try {
        const userId = req.user.userId

        // Get total submissions
        const totalSubmissions = await Submission.countDocuments({ userId })

        // Get passed submissions
        const passedSubmissions = await Submission.countDocuments({
            userId,
            status: 'Passed'
        })

        // Get unique challenges attempted
        const challengesAttempted = await Submission.distinct('challengeId', { userId })

        // Get unique challenges passed
        const challengesPassed = await Submission.distinct('challengeId', {
            userId,
            status: 'Passed'
        })

        // Get badges earned
        const user = await User.findById(userId)
        const badgesEarned = user.challengeBadges.length

        res.json({
            success: true,
            stats: {
                totalSubmissions,
                passedSubmissions,
                challengesAttempted: challengesAttempted.length,
                challengesPassed: challengesPassed.length,
                badgesEarned,
                successRate: totalSubmissions > 0
                    ? ((passedSubmissions / totalSubmissions) * 100).toFixed(2)
                    : 0
            }
        })
    } catch (error) {
        console.error('❌ Error fetching stats:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        })
    }
})

// @route   GET /api/execute/badges
// @desc    Get user's earned badges
// @access  Private
router.get('/badges', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate({
                path: 'challengeBadges.challengeId',
                select: 'title slug difficulty language'
            })

        res.json({
            success: true,
            count: user.challengeBadges.length,
            badges: user.challengeBadges
        })
    } catch (error) {
        console.error('❌ Error fetching badges:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch badges',
            error: error.message
        })
    }
})

// @route   GET /api/execute/badges/:challengeId
// @desc    Check if user has badge for specific challenge
// @access  Private
router.get('/badges/:challengeId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)

        const badge = user.challengeBadges.find(
            b => b.challengeId.toString() === req.params.challengeId
        )

        res.json({
            success: true,
            hasBadge: !!badge,
            badge: badge || null
        })
    } catch (error) {
        console.error('❌ Error checking badge:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to check badge',
            error: error.message
        })
    }
})

module.exports = router
