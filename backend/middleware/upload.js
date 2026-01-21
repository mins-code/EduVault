const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Setup uploads directory
const uploadsDir = path.join(__dirname, '../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Use disk storage for reliable file handling
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
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

// Configure multer with disk storage
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024  // 10MB limit
    }
});

module.exports = upload;
