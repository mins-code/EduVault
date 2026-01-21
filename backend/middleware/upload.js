const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure Cloudinary Storage
// Using 'private' delivery type - documents require signed URLs to access
// NOTE: 'authenticated' requires token-based auth (paid feature)
// 'private' works with signed URLs using API secret (standard feature)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'eduvault_docs',
        type: 'private',  // Private delivery - requires signed URL to access
        resource_type: 'auto',  // Automatically detect file type
        allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt', 'zip']
    }
});

// File filter for validation
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'text/plain',
        'application/zip',
        'application/x-zip-compressed'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG, TXT, and ZIP files are allowed.'), false);
    }
};

// Configure multer with Cloudinary storage
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024  // 10MB limit
    }
});

module.exports = upload;
