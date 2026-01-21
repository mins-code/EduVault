const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    cloudinaryUrl: {
        type: String,
        required: false  // Optional for backward compatibility
    },
    cloudinaryPublicId: {
        type: String,
        required: false  // Optional for backward compatibility
    },
    fileSize: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        enum: ['Academics', 'Internships', 'Projects', 'Certifications', 'Extracurriculars'],
        required: true
    },
    tags: [{
        type: String
    }],
    isPublic: {
        type: Boolean,
        default: false  // Documents are private by default
    },
    derivedTitle: {
        type: String,
        required: false  // Extracted from PDF, optional for non-PDF files
    },
    derivedDescription: {
        type: String,
        required: false  // Extracted from PDF content
    },
    userEdited: {
        type: Boolean,
        default: false  // True if user manually edited derived content
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);
