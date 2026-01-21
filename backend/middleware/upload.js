const multer = require('multer');

// Use memory storage to get file buffer for PDF parsing
// Files will be manually uploaded to Cloudinary after extraction
const storage = multer.memoryStorage();

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

// Configure multer with memory storage
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024  // 10MB limit
    }
});

module.exports = upload;
