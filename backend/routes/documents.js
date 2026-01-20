const express = require('express');
const Document = require('../models/Document');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

const router = express.Router();

// @route   POST /api/documents/upload
// @desc    Upload a document to Cloudinary
// @access  Private (requires authentication)
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        console.log('📤 Upload request received');

        // Check if file was uploaded
        if (!req.file) {
            console.log('❌ No file in request');
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        console.log('📁 File received:', {
            originalname: req.file.originalname,
            size: req.file.size,
            path: req.file.path,
            filename: req.file.filename
        });

        const { category, tags, userId } = req.body;

        // Validate required fields
        if (!category || !userId) {
            console.log('❌ Missing required fields:', { category, userId });
            // Delete uploaded file from Cloudinary if validation fails
            if (req.file.filename) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return res.status(400).json({
                success: false,
                message: 'Category and userId are required'
            });
        }

        console.log('✅ Validation passed');
        console.log('☁️  File uploaded to Cloudinary:', req.file.path);
        console.log('🆔 Cloudinary Public ID:', req.file.filename);

        // Parse tags if it's a string
        let parsedTags = [];
        if (tags) {
            parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        }

        // Create document record with Cloudinary data
        const newDocument = new Document({
            userId: userId,
            fileName: req.file.filename || req.file.originalname,
            originalName: req.file.originalname,
            fileUrl: req.file.path,  // Cloudinary secure_url
            cloudinaryUrl: req.file.path,  // Cloudinary secure_url
            cloudinaryPublicId: req.file.filename,  // Cloudinary public_id
            fileSize: req.file.size,
            category: category,
            tags: parsedTags
        });

        console.log('💾 Saving document to MongoDB...');
        await newDocument.save();
        console.log('✅ Document saved to DB:', newDocument._id);

        const responseData = {
            success: true,
            message: 'Document uploaded successfully to cloud',
            document: {
                id: newDocument._id,
                fileName: newDocument.originalName,
                fileSize: newDocument.fileSize,
                category: newDocument.category,
                uploadDate: newDocument.uploadDate,
                cloudinaryUrl: newDocument.cloudinaryUrl,
                cloudinaryPublicId: newDocument.cloudinaryPublicId
            }
        };

        console.log('📤 Sending response to frontend');
        res.status(201).json(responseData);

    } catch (error) {
        console.error('❌ Upload error:', error);
        console.error('Error stack:', error.stack);

        // Clean up Cloudinary file if database save fails
        if (req.file && req.file.filename) {
            try {
                console.log('🧹 Cleaning up Cloudinary file...');
                await cloudinary.uploader.destroy(req.file.filename);
            } catch (cleanupError) {
                console.error('❌ Cleanup error:', cleanupError);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Error uploading document',
            error: error.message
        });
    }
});

// @route   GET /api/documents/view/:id
// @desc    Generate signed URL for secure document viewing
// @access  Private
router.get('/view/:id', async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Check if document has Cloudinary data
        if (!document.cloudinaryPublicId) {
            return res.status(400).json({
                success: false,
                message: 'Document not stored in cloud'
            });
        }

        // Generate signed URL with 10-minute expiry
        const signedUrl = cloudinary.url(document.cloudinaryPublicId, {
            sign_url: true,
            type: 'authenticated',
            expires_at: Math.floor(Date.now() / 1000) + (10 * 60)  // 10 minutes from now
        });

        res.json({
            success: true,
            signedUrl: signedUrl,
            expiresIn: '10 minutes',
            document: {
                id: document._id,
                fileName: document.originalName,
                category: document.category
            }
        });

    } catch (error) {
        console.error('View document error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating secure link',
            error: error.message
        });
    }
});

// @route   GET /api/documents/user/:userId
// @desc    Get all documents for a user
// @access  Private
router.get('/user/:userId', async (req, res) => {
    try {
        const documents = await Document.find({ userId: req.params.userId })
            .sort({ uploadDate: -1 });

        res.json({
            success: true,
            count: documents.length,
            documents: documents
        });

    } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching documents',
            error: error.message
        });
    }
});

// @route   GET /api/documents/:id
// @desc    Get a single document by ID
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        res.json({
            success: true,
            document: document
        });

    } catch (error) {
        console.error('Get document error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching document',
            error: error.message
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

        // Delete from Cloudinary if it exists
        if (document.cloudinaryPublicId) {
            try {
                await cloudinary.uploader.destroy(document.cloudinaryPublicId);
            } catch (cloudinaryError) {
                console.error('Cloudinary deletion error:', cloudinaryError);
                // Continue with database deletion even if Cloudinary fails
            }
        }

        // Delete from database
        await Document.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Document deleted successfully'
        });

    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting document',
            error: error.message
        });
    }
});

module.exports = router;
