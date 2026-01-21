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
                await cloudinary.uploader.destroy(req.file.filename, {
                    type: 'private',
                    resource_type: 'image',
                    invalidate: true
                });
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
                await cloudinary.uploader.destroy(req.file.filename, {
                    type: 'private',
                    resource_type: 'image',
                    invalidate: true
                });
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
        console.log('🔒 Signed URL request for document:', req.params.id);

        const document = await Document.findById(req.params.id);

        if (!document) {
            console.log('❌ Document not found');
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        console.log('📄 Document found:', document.originalName);

        // Check if document has Cloudinary data
        if (!document.cloudinaryPublicId) {
            console.log('⚠️  No cloudinaryPublicId - document not in cloud');
            return res.status(400).json({
                success: false,
                message: 'Document not stored in cloud'
            });
        }

        console.log('☁️  Cloudinary Public ID:', document.cloudinaryPublicId);

        // Determine file extension/format from original name
        const fileExt = document.originalName.split('.').pop().toLowerCase();
        console.log('📄 File extension:', fileExt);

        // For private resources, generate a time-limited signed URL
        // Using private_download_url which creates a proper signed URL for private assets
        const expiresAt = Math.floor(Date.now() / 1000) + (10 * 60); // 10 minutes from now

        // Generate signed URL using private_download_url
        // This is the correct method for 'private' delivery type
        const signedUrl = cloudinary.utils.private_download_url(
            document.cloudinaryPublicId,
            fileExt,  // Format
            {
                resource_type: 'image',  // PDFs are stored as 'image' in Cloudinary
                expires_at: expiresAt,
                attachment: false  // View in browser, not download
            }
        );

        console.log('✅ Generated private signed URL');
        console.log('🔗 URL:', signedUrl);
        console.log('⏰ Expires:', new Date(expiresAt * 1000).toISOString());

        res.json({
            success: true,
            signedUrl: signedUrl,
            expiresIn: '10 minutes',
            expiresAt: expiresAt,
            document: {
                id: document._id,
                fileName: document.originalName,
                category: document.category
            }
        });

    } catch (error) {
        console.error('❌ View document error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error generating secure link',
            error: error.message
        });
    }
});

// @route   GET /api/documents/download/:id
// @desc    Generate signed URL for document download (forces attachment)
// @access  Private
router.get('/download/:id', async (req, res) => {
    try {
        console.log('📥 Download URL request for document:', req.params.id);

        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        if (!document.cloudinaryPublicId) {
            return res.status(400).json({
                success: false,
                message: 'Document not stored in cloud'
            });
        }

        const fileExt = document.originalName.split('.').pop().toLowerCase();
        const expiresAt = Math.floor(Date.now() / 1000) + (10 * 60);

        // Generate signed URL with attachment: true for download
        const downloadUrl = cloudinary.utils.private_download_url(
            document.cloudinaryPublicId,
            fileExt,
            {
                resource_type: 'image',
                expires_at: expiresAt,
                attachment: true  // Forces browser to download instead of view
            }
        );

        console.log('✅ Generated download URL');
        console.log('🔗 URL:', downloadUrl);

        res.json({
            success: true,
            downloadUrl: downloadUrl,
            fileName: document.originalName,
            expiresIn: '10 minutes'
        });

    } catch (error) {
        console.error('❌ Download URL error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating download link',
            error: error.message
        });
    }
});

// @route   GET /api/documents/share/:id
// @desc    Generate shareable signed URL (10-minute expiry)
// @access  Private
router.get('/share/:id', async (req, res) => {
    try {
        console.log('🔗 Share URL request for document:', req.params.id);

        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        if (!document.cloudinaryPublicId) {
            return res.status(400).json({
                success: false,
                message: 'Document not stored in cloud'
            });
        }

        const fileExt = document.originalName.split('.').pop().toLowerCase();
        const expiresAt = Math.floor(Date.now() / 1000) + (10 * 60);

        // Generate shareable signed URL
        const shareUrl = cloudinary.utils.private_download_url(
            document.cloudinaryPublicId,
            fileExt,
            {
                resource_type: 'image',
                expires_at: expiresAt,
                attachment: false  // View in browser
            }
        );

        console.log('✅ Generated share URL (expires in 10 min)');

        res.json({
            success: true,
            shareUrl: shareUrl,
            fileName: document.originalName,
            expiresIn: '10 minutes',
            expiresAt: expiresAt
        });

    } catch (error) {
        console.error('❌ Share URL error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating share link',
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
        console.log('🗑️  Delete request for document:', req.params.id);

        const document = await Document.findById(req.params.id);

        if (!document) {
            console.log('❌ Document not found:', req.params.id);
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        console.log('📄 Document found:', document.originalName);

        // Delete from Cloudinary if it exists
        if (document.cloudinaryPublicId) {
            console.log('☁️  Deleting from Cloudinary:', document.cloudinaryPublicId);

            // Try multiple type/resource_type combinations since files may have been 
            // uploaded with different modes (authenticated, private, or public upload)
            const deleteConfigs = [
                { type: 'authenticated', resource_type: 'image' },
                { type: 'private', resource_type: 'image' },
                { type: 'upload', resource_type: 'image' },
                { type: 'authenticated', resource_type: 'raw' },
                { type: 'private', resource_type: 'raw' },
                { type: 'upload', resource_type: 'raw' }
            ];

            let deleted = false;
            let lastResult = null;

            for (const config of deleteConfigs) {
                try {
                    console.log(`📋 Trying deletion with: type=${config.type}, resource_type=${config.resource_type}`);

                    const cloudinaryResult = await cloudinary.uploader.destroy(
                        document.cloudinaryPublicId,
                        {
                            type: config.type,
                            resource_type: config.resource_type,
                            invalidate: true
                        }
                    );

                    console.log(`📊 Result: ${cloudinaryResult.result}`);
                    lastResult = cloudinaryResult;

                    if (cloudinaryResult.result === 'ok') {
                        console.log('✅ Cloudinary deletion successful!');
                        deleted = true;
                        break;
                    }
                } catch (err) {
                    console.log(`⚠️  Config failed: ${err.message}`);
                }
            }

            if (!deleted && lastResult?.result !== 'not found') {
                console.log('⚠️  Could not delete from Cloudinary, proceeding with DB deletion');
            }
        } else {
            console.log('⚠️  No cloudinaryPublicId - skipping cloud deletion');
        }

        // Delete from database
        console.log('💾 Deleting from MongoDB...');
        await Document.findByIdAndDelete(req.params.id);
        console.log('✅ Document deleted successfully');

        res.json({
            success: true,
            message: 'Document deleted successfully'
        });

    } catch (error) {
        console.error('❌ Delete document error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting document',
            error: error.message
        });
    }
});

module.exports = router;
