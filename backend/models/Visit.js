const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    viewerRole: {
        type: String,
        enum: ['recruiter', 'guest'],
        required: true
    },
    viewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    recruiterCompany: {
        type: String,
        default: null
    },
    ipAddress: {
        type: String,
        required: true
    },
    location: {
        type: String,
        default: 'Unknown'
    },
    city: {
        type: String,
        default: null
    },
    country: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        required: true
    },
    browser: {
        type: String,
        default: 'Unknown'
    },
    os: {
        type: String,
        default: 'Unknown'
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Index for efficient queries
visitSchema.index({ profileId: 1, timestamp: -1 });
visitSchema.index({ profileId: 1, viewerRole: 1 });

module.exports = mongoose.model('Visit', visitSchema);
