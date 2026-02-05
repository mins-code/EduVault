const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    githubLink: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    tags: {
        type: [String],
        default: []
    },
    stats: {
        stars: {
            type: Number,
            default: 0
        },
        forks: {
            type: Number,
            default: 0
        },
        lastCommit: {
            type: Date,
            default: null
        }
    },
    activityGraph: {
        type: [Number],
        default: []
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
projectSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
