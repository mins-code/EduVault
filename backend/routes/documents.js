const express = require('express');
const fs = require('fs');
const Document = require('../models/Document');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const { extractPDFContent } = require('../utils/pdfExtractor');

const router = express.Router();

// Helper function to upload buffer to Cloudinary using upload_stream
const uploadToCloudinary = (buffer, originalName) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'eduvault_docs',
                resource_type: 'image',
                type: 'private',
                public_id: `${Date.now()}_${originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_')}`
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        // Pipe the buffer directly to the upload stream
        uploadStream.end(buffer);
    });
};

// @route   POST /api/documents/upload
// @desc    Upload a document to Cloudinary with PDF content extraction (Disk-First)
// @access  Private (requires authentication)
router.post('/upload', upload.single('file'), async (req, res) => {
    let localFilePath = null;

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

        // With diskStorage, req.file.path contains the local file path
        localFilePath = req.file.path;

        console.log('📁 File received (disk-first):', {
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            path: localFilePath
        });

        const { category, tags, userId } = req.body;

        // Validate required fields
        if (!userId) {
            console.log('❌ Missing userId');
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            });
        }

        console.log('✅ Validation passed');

        // Extract PDF content if file is a PDF
        let extractedData = {
            derivedTitle: null,
            derivedDescription: null,
            suggestedCategory: null,
            extractedText: null
        };

        const isPDF = req.file.originalname.toLowerCase().endsWith('.pdf');

        console.log('🔍 File check:', {
            originalname: req.file.originalname,
            isPDF: isPDF,
            localPath: localFilePath
        });

        if (isPDF && localFilePath) {
            console.log('📄 PDF detected - reading from disk and extracting content...');
            try {
                // Read file from disk into buffer
                const fileBuffer = fs.readFileSync(localFilePath);
                console.log('📚 File buffer size:', fileBuffer.length);

                // Use the robust utility function
                const extractionResult = await extractPDFContent(fileBuffer);

                // Map the utility result to our data structure
                extractedData.derivedTitle = extractionResult.derivedTitle;
                extractedData.derivedDescription = extractionResult.derivedDescription;
                extractedData.suggestedCategory = extractionResult.suggestedCategory;
                extractedData.extractedText = extractionResult.extractedText;

                console.log('✅ Extraction Result:', {
                    title: extractedData.derivedTitle,
                    category: extractedData.suggestedCategory,
                    descLength: extractedData.derivedDescription?.length
                });
            } catch (pdfError) {
                console.error('⚠️ Extraction failed:', pdfError);
            }

            // strict fallback: ensure derivedTitle is never null if we have a file
            if (!extractedData.derivedTitle && req.file && req.file.originalname) {
                console.log('⚠️ Title extraction returned null, using filename fallback');
                extractedData.derivedTitle = req.file.originalname.replace(/\.[^/.]+$/, '');
            }
        } else {
            console.log('⚠️ Skipping PDF extraction:', { isPDF, hasPath: !!localFilePath });
            // Non-PDF files: use filename as title
            extractedData.derivedTitle = req.file.originalname.replace(/\.[^/.]+$/, '');
        }

        // Upload file to Cloudinary using file path (more stable than streaming)
        console.log('☁️  Uploading to Cloudinary from disk...');
        const cloudinaryResult = await cloudinary.uploader.upload(localFilePath, {
            folder: 'eduvault_docs',
            resource_type: 'auto',
            type: 'private',
            public_id: `${Date.now()}_${req.file.originalname.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_')}`
        });

        console.log('✅ Cloudinary upload successful:', {
            public_id: cloudinaryResult.public_id,
            secure_url: cloudinaryResult.secure_url
        });

        // Parse tags if it's a string
        let parsedTags = [];
        if (tags) {
            parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        }

        // Determine final category: use suggested if available, otherwise use provided
        const finalCategory = extractedData.suggestedCategory || category || 'Other';

        // Create document record with Cloudinary data and extracted content
        const newDocument = new Document({
            userId: userId,
            fileName: cloudinaryResult.public_id,
            originalName: req.file.originalname,
            fileUrl: cloudinaryResult.secure_url,
            cloudinaryUrl: cloudinaryResult.secure_url,
            cloudinaryPublicId: cloudinaryResult.public_id,
            fileSize: req.file.size,
            category: finalCategory,
            tags: parsedTags,
            derivedTitle: extractedData.derivedTitle,
            derivedDescription: extractedData.derivedDescription,
            extractedText: extractedData.extractedText
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
                cloudinaryPublicId: newDocument.cloudinaryPublicId,
                // Include extracted data for review modal
                derivedTitle: newDocument.derivedTitle,
                derivedDescription: newDocument.derivedDescription,
                suggestedCategory: extractedData.suggestedCategory
            }
        };

        console.log('📤 Sending response to frontend');
        console.log('📤 Response data:', JSON.stringify(responseData, null, 2));
        res.status(201).json(responseData);

    } catch (error) {
        console.error('❌ Upload error:', error);
        console.error('Error stack:', error.stack);

        res.status(500).json({
            success: false,
            message: 'Error uploading document',
            error: error.message
        });
    } finally {
        // Cleanup: Delete local file after processing
        if (localFilePath && fs.existsSync(localFilePath)) {
            try {
                fs.unlinkSync(localFilePath);
                console.log('🗑️ Local file cleaned up:', localFilePath);
            } catch (cleanupError) {
                console.error('⚠️ Failed to cleanup local file:', cleanupError);
            }
        }
    }
});

// @route   POST /api/documents/extract/:id
// @desc    Extract content from uploaded PDF
// @access  Private
router.post('/extract/:id', async (req, res) => {
    try {
        console.log('📄 PDF extraction request for document:', req.params.id);

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
                message: 'Document has no cloud storage'
            });
        }

        console.log('📂 Document found:', document.originalName);
        console.log('🔑 Cloudinary Public ID:', document.cloudinaryPublicId);

        let pdfBuffer = null;

        // Try method 1: resource_type 'raw' (PDFs are usually stored as raw with auto)
        try {
            console.log('📥 Trying raw resource type...');
            const signedUrl = cloudinary.url(document.cloudinaryPublicId, {
                type: 'private',
                sign_url: true,
                resource_type: 'raw'
            });
            console.log('🔗 Signed URL (raw):', signedUrl);

            const response = await axios.get(signedUrl, {
                responseType: 'arraybuffer',
                timeout: 30000
            });
            pdfBuffer = Buffer.from(response.data);
            console.log('📊 Downloaded via raw:', pdfBuffer.length, 'bytes');
        } catch (err1) {
            console.log('⚠️ Raw method failed:', err1.message);

            // Try method 2: resource_type 'image' 
            try {
                console.log('📥 Trying image resource type...');
                const signedUrl = cloudinary.url(document.cloudinaryPublicId, {
                    type: 'private',
                    sign_url: true,
                    resource_type: 'image'
                });
                console.log('🔗 Signed URL (image):', signedUrl);

                const response = await axios.get(signedUrl, {
                    responseType: 'arraybuffer',
                    timeout: 30000
                });
                pdfBuffer = Buffer.from(response.data);
                console.log('📊 Downloaded via image:', pdfBuffer.length, 'bytes');
            } catch (err2) {
                console.log('⚠️ Image method failed:', err2.message);

                // Try method 3: Use cloudinaryUrl directly (if stored properly)
                try {
                    console.log('📥 Trying stored cloudinaryUrl...');
                    if (document.cloudinaryUrl) {
                        // Add signature to existing URL
                        const response = await axios.get(document.cloudinaryUrl, {
                            responseType: 'arraybuffer',
                            timeout: 30000
                        });
                        pdfBuffer = Buffer.from(response.data);
                        console.log('📊 Downloaded via cloudinaryUrl:', pdfBuffer.length, 'bytes');
                    } else {
                        throw new Error('No cloudinaryUrl available');
                    }
                } catch (err3) {
                    console.log('⚠️ cloudinaryUrl method failed:', err3.message);
                    throw new Error('Unable to download PDF from cloud storage');
                }
            }
        }

        console.log('🔍 Extracting text from PDF...');
        const extractedData = await extractPDFContent(pdfBuffer);

        console.log('📝 Extracted data:', {
            title: extractedData.derivedTitle,
            category: extractedData.suggestedCategory,
            descriptionLength: extractedData.derivedDescription?.length || 0,
            fullTextPreview: extractedData.fullText?.substring(0, 100)
        });

        // Update document with extracted data
        document.derivedTitle = extractedData.derivedTitle || document.derivedTitle;
        document.derivedDescription = extractedData.derivedDescription;
        await document.save();

        console.log('✅ PDF extraction complete and saved to DB');

        res.json({
            success: true,
            message: 'PDF content extracted successfully',
            extractedData: {
                derivedTitle: extractedData.derivedTitle,
                derivedDescription: extractedData.derivedDescription,
                suggestedCategory: extractedData.suggestedCategory
            }
        });

    } catch (error) {
        console.error('❌ PDF extraction error:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error extracting PDF content',
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

// @route   PATCH /api/documents/:id/visibility
// @desc    Toggle document visibility on public portfolio
// @access  Private
router.patch('/:id/visibility', async (req, res) => {
    try {
        const { isPublic } = req.body;
        console.log(`🔄 Visibility toggle request for document: ${req.params.id}, isPublic: ${isPublic}`);

        // Validate isPublic is a boolean
        if (typeof isPublic !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isPublic must be a boolean value'
            });
        }

        // Find document
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Update visibility
        document.isPublic = isPublic;
        await document.save();

        console.log(`✅ Document visibility updated: ${document.originalName} is now ${isPublic ? 'PUBLIC' : 'PRIVATE'}`);

        res.json({
            success: true,
            message: `Document is now ${isPublic ? 'visible' : 'hidden'} on your portfolio`,
            document: {
                id: document._id,
                originalName: document.originalName,
                isPublic: document.isPublic
            }
        });

    } catch (error) {
        console.error('❌ Visibility toggle error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating document visibility',
            error: error.message
        });
    }
});

// @route   PATCH /api/documents/:id/metadata
// @desc    Update document derived metadata (title, description)
// @access  Private
router.patch('/:id/metadata', async (req, res) => {
    try {
        const { derivedTitle, derivedDescription, category } = req.body;
        console.log(`📝 Metadata update request for document: ${req.params.id}`);

        // Find document
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Update fields if provided
        if (derivedTitle !== undefined) {
            document.derivedTitle = derivedTitle;
        }
        if (derivedDescription !== undefined) {
            document.derivedDescription = derivedDescription;
        }
        if (category !== undefined) {
            document.category = category;
        }

        // Mark as user-edited
        document.userEdited = true;

        await document.save();

        console.log(`✅ Metadata updated for: ${document.originalName}`);

        res.json({
            success: true,
            message: 'Document metadata updated successfully',
            document: {
                id: document._id,
                originalName: document.originalName,
                derivedTitle: document.derivedTitle,
                derivedDescription: document.derivedDescription,
                category: document.category,
                userEdited: document.userEdited
            }
        });

    } catch (error) {
        console.error('❌ Metadata update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating document metadata',
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
