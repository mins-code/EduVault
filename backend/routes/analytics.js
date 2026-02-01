const express = require('express');
const mongoose = require('mongoose');
const Visit = require('../models/Visit');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/my-traffic
// @desc    Get visit analytics for authenticated student
// @access  Private (Student only)
router.get('/my-traffic', auth, async (req, res) => {
    try {
        console.log('📊 Full decoded token:', req.user);
        const userId = req.user.userId || req.user.id;
        console.log('📊 Analytics request for userId:', userId);

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
        }

        // Convert userId to ObjectId for proper matching
        const profileObjectId = new mongoose.Types.ObjectId(userId);

        // Get last 20 visits
        const recentVisits = await Visit.find({ profileId: profileObjectId })
            .sort({ timestamp: -1 })
            .limit(20)
            .lean();

        console.log('📊 Found visits:', recentVisits.length);

        // Get total views count
        const totalViews = await Visit.countDocuments({ profileId: profileObjectId });

        // Get unique visitors (by IP)
        const uniqueVisitors = await Visit.distinct('ipAddress', { profileId: profileObjectId });
        const uniqueCount = uniqueVisitors.length;

        // Get top locations
        const locationAggregation = await Visit.aggregate([
            { $match: { profileId: profileObjectId } },
            { $group: { _id: '$location', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const topLocations = locationAggregation.map(loc => ({
            location: loc._id,
            count: loc.count
        }));

        // Viewer role breakdown
        const recruiterViews = await Visit.countDocuments({
            profileId: profileObjectId,
            viewerRole: 'recruiter'
        });
        const guestViews = await Visit.countDocuments({
            profileId: profileObjectId,
            viewerRole: 'guest'
        });

        console.log('📊 Analytics summary:', {
            totalViews,
            uniqueCount,
            recruiterViews,
            guestViews,
            topLocations: topLocations.length
        });

        res.json({
            success: true,
            analytics: {
                totalViews,
                uniqueVisitors: uniqueCount,
                recruiterViews,
                guestViews,
                topLocations,
                recentVisits: recentVisits.map(visit => ({
                    timestamp: visit.timestamp,
                    location: visit.location,
                    city: visit.city,
                    country: visit.country,
                    browser: visit.browser,
                    os: visit.os,
                    viewerRole: visit.viewerRole,
                    recruiterCompany: visit.recruiterCompany
                }))
            }
        });

    } catch (error) {
        console.error('Analytics fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics data'
        });
    }
});

// @route   GET /api/analytics/summary
// @desc    Get quick analytics summary
// @access  Private (Student only)
router.get('/summary', auth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
        }

        // Convert userId to ObjectId for proper matching
        const profileObjectId = new mongoose.Types.ObjectId(userId);

        // Today's views
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayViews = await Visit.countDocuments({
            profileId: profileObjectId,
            timestamp: { $gte: todayStart }
        });

        // This week's views
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        const weekViews = await Visit.countDocuments({
            profileId: profileObjectId,
            timestamp: { $gte: weekStart }
        });

        // Total views
        const totalViews = await Visit.countDocuments({ profileId: profileObjectId });

        // Top location
        const topLocationResult = await Visit.aggregate([
            { $match: { profileId: profileObjectId } },
            { $group: { _id: '$location', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);

        const topLocation = topLocationResult.length > 0
            ? topLocationResult[0]._id
            : 'No data';

        res.json({
            success: true,
            summary: {
                todayViews,
                weekViews,
                totalViews,
                topLocation
            }
        });

    } catch (error) {
        console.error('Summary fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching summary data'
        });
    }
});

module.exports = router;
