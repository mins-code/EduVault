const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    position: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['To Apply', 'Applied', 'Interviewing', 'Offer', 'Rejected'],
        default: 'To Apply'
    },
    salary: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    link: {
        type: String,
        trim: true
    },
    notes: {
        type: String
    },
    linkedDocuments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
    }],
    appliedDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for efficient querying by user
jobApplicationSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
