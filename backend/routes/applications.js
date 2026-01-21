const express = require('express');
const JobApplication = require('../models/JobApplication');

const router = express.Router();

// @route   GET /api/applications
// @desc    Get all job applications for the logged-in user
// @access  Private
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            });
        }

        const applications = await JobApplication.find({ userId })
            .populate('linkedDocuments', 'originalName fileUrl category')
            .sort({ updatedAt: -1 });

        res.json({
            success: true,
            count: applications.length,
            applications
        });

    } catch (error) {
        console.error('❌ Get applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching applications',
            error: error.message
        });
    }
});

// @route   POST /api/applications
// @desc    Create a new job application
// @access  Private
router.post('/', async (req, res) => {
    try {
        const { userId, company, position, status, salary, location, link, notes, linkedDocuments, appliedDate } = req.body;

        // Validate required fields
        if (!userId || !company || !position) {
            return res.status(400).json({
                success: false,
                message: 'userId, company, and position are required'
            });
        }

        const newApplication = new JobApplication({
            userId,
            company,
            position,
            status: status || 'To Apply',
            salary,
            location,
            link,
            notes,
            linkedDocuments: linkedDocuments || [],
            appliedDate
        });

        await newApplication.save();

        const populatedApplication = await JobApplication.findById(newApplication._id)
            .populate('linkedDocuments', 'originalName fileUrl category');

        console.log('✅ Job application created:', newApplication._id);

        res.status(201).json({
            success: true,
            message: 'Job application created successfully',
            application: populatedApplication
        });

    } catch (error) {
        console.error('❌ Create application error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating application',
            error: error.message
        });
    }
});

// @route   PATCH /api/applications/:id
// @desc    Update a job application
// @access  Private
router.patch('/:id', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required for authorization'
            });
        }

        // Find application and verify ownership
        const application = await JobApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Verify user owns this application
        if (application.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: You can only update your own applications'
            });
        }

        // Update allowed fields
        const allowedUpdates = ['company', 'position', 'status', 'salary', 'location', 'link', 'notes', 'linkedDocuments', 'appliedDate'];
        const updates = {};

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const updatedApplication = await JobApplication.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).populate('linkedDocuments', 'originalName fileUrl category');

        console.log('✅ Job application updated:', req.params.id);

        res.json({
            success: true,
            message: 'Job application updated successfully',
            application: updatedApplication
        });

    } catch (error) {
        console.error('❌ Update application error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating application',
            error: error.message
        });
    }
});

// @route   DELETE /api/applications/:id
// @desc    Delete a job application
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required for authorization'
            });
        }

        // Find application and verify ownership
        const application = await JobApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Verify user owns this application
        if (application.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: You can only delete your own applications'
            });
        }

        await JobApplication.findByIdAndDelete(req.params.id);

        console.log('✅ Job application deleted:', req.params.id);

        res.json({
            success: true,
            message: 'Job application deleted successfully'
        });

    } catch (error) {
        console.error('❌ Delete application error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting application',
            error: error.message
        });
    }
});

module.exports = router;
