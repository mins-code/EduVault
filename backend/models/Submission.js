const mongoose = require('mongoose')

const submissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    challengeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge',
        required: true,
        index: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        enum: ['javascript', 'python'],
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Running', 'Passed', 'Failed', 'Error'],
        default: 'Pending'
    },
    testResults: [{
        testName: String,
        passed: Boolean,
        expected: String,
        actual: String,
        error: String
    }],
    executionTime: {
        type: Number, // in milliseconds
        default: 0
    },
    memoryUsed: {
        type: Number, // in bytes
        default: 0
    },
    errorMessage: {
        type: String
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    // Badge tracking
    badgeAwarded: {
        type: Boolean,
        default: false
    },
    badgeAwardedAt: {
        type: Date
    },
    // Judge0 submission tokens
    judge0Tokens: [{
        type: String
    }]
}, {
    timestamps: true
})

// Compound indexes for efficient queries
submissionSchema.index({ userId: 1, challengeId: 1 })
submissionSchema.index({ userId: 1, status: 1 })
submissionSchema.index({ challengeId: 1, status: 1 })

// Virtual for pass rate
submissionSchema.virtual('passRate').get(function () {
    if (!this.testResults || this.testResults.length === 0) return 0
    const passed = this.testResults.filter(t => t.passed).length
    return ((passed / this.testResults.length) * 100).toFixed(2)
})

// Method to check if all tests passed
submissionSchema.methods.allTestsPassed = function () {
    if (!this.testResults || this.testResults.length === 0) return false
    return this.testResults.every(t => t.passed)
}

// Static method to get user's best submission for a challenge
submissionSchema.statics.getBestSubmission = async function (userId, challengeId) {
    return this.findOne({
        userId,
        challengeId,
        status: 'Passed'
    }).sort({ executionTime: 1 }).exec()
}

// Static method to get user's submission history for a challenge
submissionSchema.statics.getUserHistory = async function (userId, challengeId) {
    return this.find({
        userId,
        challengeId
    }).sort({ submittedAt: -1 }).exec()
}

const Submission = mongoose.model('Submission', submissionSchema)

module.exports = Submission
