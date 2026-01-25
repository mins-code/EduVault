const mongoose = require('mongoose');

// Define the Recruiter Schema
const recruiterSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true,
        },

        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
        },

        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
        },

        companyName: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
        },

        website: {
            type: String,
            trim: true,
            default: '',
        },

        // Bookmarked student profiles
        bookmarks: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        // Automatically add createdAt and updatedAt timestamps
        timestamps: true,
    }
);

// Create and export the Recruiter model
const Recruiter = mongoose.model('Recruiter', recruiterSchema);

module.exports = Recruiter;
