const mongoose = require('mongoose')

const challengeSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    language: {
        type: String,
        enum: ['javascript', 'python', 'java', 'cpp'],
        required: true
    },
    track: {
        type: String,
        required: true
    },
    starterCode: {
        type: String,
        required: true
    },
    testCode: {
        type: String,
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    blurb: {
        type: String,
        trim: true
    },
    // Test cases for Judge0 execution
    testCases: [{
        input: {
            type: String,
            default: ''
        },
        expectedOutput: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ''
        },
        isHidden: {
            type: Boolean,
            default: false
        }
    }],
    // Metadata from Exercism
    authors: [{
        type: String
    }],
    // Statistics
    totalAttempts: {
        type: Number,
        default: 0
    },
    totalPassed: {
        type: Number,
        default: 0
    },
    // Status
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

// Indexes for efficient queries
challengeSchema.index({ language: 1, difficulty: 1 })
challengeSchema.index({ tags: 1 })
challengeSchema.index({ slug: 1 })

// Virtual for success rate
challengeSchema.virtual('successRate').get(function () {
    if (this.totalAttempts === 0) return 0
    return ((this.totalPassed / this.totalAttempts) * 100).toFixed(2)
})

// Method to increment attempt count
challengeSchema.methods.recordAttempt = async function (passed) {
    this.totalAttempts += 1
    if (passed) {
        this.totalPassed += 1
    }
    return this.save()
}

const Challenge = mongoose.model('Challenge', challengeSchema)

module.exports = Challenge
