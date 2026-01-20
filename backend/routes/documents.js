const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp-randomstring-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// File filter to accept only specific file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|txt|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only documents and images are allowed (PDF, DOC, DOCX, JPG, PNG, TXT, ZIP)'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

// @route   POST /api/documents/upload
// @desc    Upload a document
// @access  Private (requires authentication)
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const { category, tags, userId } = req.body;

        // Validate required fields
        if (!category || !userId) {
            // Delete uploaded file if validation fails
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Category and userId are required'
            });
        }

        // Parse tags if it's a string
        let parsedTags = [];
        if (tags) {
            parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        }

        // Create document record
        const newDocument = new Document({
            userId: userId,
            fileName: req.file.filename,
            originalName: req.file.originalname,
            fileUrl: `/uploads/${req.file.filename}`,
            fileSize: req.file.size,
            category: category,
            tags: parsedTags
        });

        await newDocument.save();

        res.status(201).json({
            success: true,
            message: 'Document uploaded successfully',
            document: {
                id: newDocument._id,
                fileName: newDocument.originalName,
                fileSize: newDocument.fileSize,
                category: newDocument.category,
                uploadDate: newDocument.uploadDate,
                fileUrl: newDocument.fileUrl
            }
        });

    } catch (error) {
        console.error('Upload error:', error);

        // Delete uploaded file if database operation fails
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Server error during upload'
        });
    }
});

// @route   GET /api/documents
// @desc    Get all documents for a user
// @access  Private
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            });
        }

        const documents = await Document.find({ userId: userId })
            .sort({ uploadDate: -1 });

        res.status(200).json({
            success: true,
            count: documents.length,
            documents: documents
        });

    } catch (error) {
        console.error('Fetch documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching documents'
        });
    }
});

// @route   DELETE /api/documents/:id
// @desc    Delete a document
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Delete file from filesystem
        const filePath = path.join(__dirname, '..', document.fileUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete document from database
        await Document.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully'
        });

    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting document'
        });
    }
});

module.exports = router;
