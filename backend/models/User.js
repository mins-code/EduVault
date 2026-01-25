const mongoose = require('mongoose');

// Define the User Schema
const userSchema = new mongoose.Schema(
    {
        // Basic Information
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

        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            lowercase: true,
            trim: true,
            minlength: [3, 'Username must be at least 3 characters'],
        },

        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
        },

        // Portfolio Settings
        portfolioPublic: {
            type: Boolean,
            default: true,
        },

        // Academic Information
        university: {
            type: String,
            required: [true, 'University is required'],
            trim: true,
        },

        degree: {
            type: String,
            required: [true, 'Degree is required'],
            trim: true,
        },

        branch: {
            type: String,
            required: [true, 'Branch is required'],
            trim: true,
        },

        graduationYear: {
            type: Number,
            required: [true, 'Graduation year is required'],
            min: [2020, 'Graduation year must be 2020 or later'],
            max: [2030, 'Graduation year must be 2030 or earlier'],
        },

        // Recruiter Search Fields
        skills: {
            type: [String],
            default: [],
        },

        bio: {
            type: String,
            maxlength: [300, 'Bio must not exceed 300 characters'],
            default: '',
        },

        // User Role
        role: {
            type: String,
            enum: ['student', 'admin'],
            default: 'student',
        },
    },
    {
        // Automatically add createdAt and updatedAt timestamps
        timestamps: true,
    }
);

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
