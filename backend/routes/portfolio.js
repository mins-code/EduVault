const express = require('express');
const User = require('../models/User');
const Document = require('../models/Document');
const Visit = require('../models/Visit');
const Recruiter = require('../models/Recruiter');
const Project = require('../models/Project');
const cloudinary = require('../config/cloudinary');
const geoip = require('geoip-lite');

const router = express.Router();

// Visit deduplication cache: Map<"profileId:ipAddress", timestamp>
const visitCache = new Map();
const VISIT_CACHE_DURATION = 5000; // 5 seconds

// @route   GET /api/portfolio/:username
// @desc    Get public portfolio for a user
// @access  Public
router.get('/:username', async (req, res) => {
    try {
        const { username } = req.params;

        // Find user by username
        const user = await User.findOne({ username: username.toLowerCase() });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if portfolio is public
        if (!user.portfolioPublic) {
            return res.status(403).json({
                success: false,
                message: 'This portfolio is private'
            });
        }

        // Fetch only PUBLIC documents for this user's portfolio
        const documents = await Document.find({
            userId: user._id,
            isPublic: true  // Only show documents marked as public
        }).sort({ uploadDate: -1 });

        console.log(`📊 Portfolio for ${username}: ${documents.length} public documents`);

        // === VISIT TRACKING ===
        // Log this portfolio view asynchronously (don't block response)
        setImmediate(async () => {
            try {
                // Extract IP address
                let ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
                    req.ip ||
                    req.connection.remoteAddress ||
                    'unknown';

                // Clean up IPv6 localhost format
                if (ipAddress.includes('::ffff:')) {
                    ipAddress = ipAddress.replace('::ffff:', '');
                }
                if (ipAddress === '::1' || ipAddress === '127.0.0.1' || ipAddress === 'localhost') {
                    ipAddress = '127.0.0.1';
                }

                // Check for duplicate visit (within 5 seconds from same IP to same profile)
                const cacheKey = `${user._id}:${ipAddress}`;
                const now = Date.now();
                const lastVisit = visitCache.get(cacheKey);

                if (lastVisit && (now - lastVisit) < VISIT_CACHE_DURATION) {
                    console.log('🔒 Skipping duplicate visit log (within 5s window)');
                    return;
                }

                // Update cache
                visitCache.set(cacheKey, now);

                // Clean up old cache entries (older than 10 seconds)
                for (const [key, timestamp] of visitCache.entries()) {
                    if (now - timestamp > VISIT_CACHE_DURATION * 2) {
                        visitCache.delete(key);
                    }
                }

                // Get geolocation from IP
                const geo = geoip.lookup(ipAddress);
                let location = 'Localhost';
                let city = null;
                let country = null;

                if (geo) {
                    city = geo.city || null;
                    country = geo.country || null;
                    location = city && country ? `${city}, ${country}` : (country || 'Unknown');
                } else if (ipAddress === '127.0.0.1') {
                    location = 'Localhost';
                    city = 'Local';
                    country = 'Development';
                }

                // Parse user agent
                const userAgent = req.headers['user-agent'] || 'Unknown';
                let browser = 'Unknown';
                let os = 'Unknown';

                // Simple user agent parsing
                if (userAgent.includes('Edg')) browser = 'Edge';
                else if (userAgent.includes('Chrome')) browser = 'Chrome';
                else if (userAgent.includes('Firefox')) browser = 'Firefox';
                else if (userAgent.includes('Safari')) browser = 'Safari';

                if (userAgent.includes('Windows')) os = 'Windows';
                else if (userAgent.includes('Mac')) os = 'macOS';
                else if (userAgent.includes('Linux')) os = 'Linux';
                else if (userAgent.includes('Android')) os = 'Android';
                else if (userAgent.includes('iOS')) os = 'iOS';

                // Determine viewer role by decoding JWT
                const authHeader = req.headers.authorization;
                let viewerRole = 'guest';
                let viewerId = null;
                let recruiterCompany = null;

                if (authHeader && authHeader.startsWith('Bearer ')) {
                    try {
                        const token = authHeader.substring(7);
                        const jwt = require('jsonwebtoken');
                        const decoded = jwt.verify(token, process.env.JWT_SECRET);

                        // Check if it's a student or recruiter token
                        if (decoded.userId) {
                            // Student token - check if viewing own portfolio
                            if (user._id.toString() === decoded.userId) {
                                console.log('🔒 Skipping visit log: Student viewing own portfolio');
                                return; // Don't log when students view their own portfolio
                            }
                            viewerRole = 'guest'; // Student viewing another's portfolio
                            viewerId = decoded.userId;
                        } else if (decoded.recruiterId) {
                            // Recruiter token - fetch company name
                            viewerRole = 'recruiter';
                            viewerId = decoded.recruiterId;

                            // Fetch recruiter's company name
                            try {
                                const recruiter = await Recruiter.findById(decoded.recruiterId).select('companyName');
                                if (recruiter && recruiter.companyName) {
                                    recruiterCompany = recruiter.companyName;
                                }
                            } catch (recruiterError) {
                                console.log('⚠️ Failed to fetch recruiter company:', recruiterError.message);
                            }
                        }
                    } catch (jwtError) {
                        console.log('⚠️ JWT decode failed, treating as guest');
                        viewerRole = 'guest';
                    }
                }

                // Save visit record
                const visit = new Visit({
                    profileId: user._id,
                    viewerRole,
                    viewerId,
                    recruiterCompany,
                    ipAddress,
                    location,
                    city,
                    country,
                    userAgent,
                    browser,
                    os
                });

                await visit.save();
                console.log(`🔒 Visit logged: ${location} (${viewerRole}) - ProfileId: ${user._id}`);
            } catch (visitError) {
                console.error('⚠️ Visit logging failed:', visitError.message);
                // Don't throw - logging failure shouldn't break the request
            }
        });

        // Return user profile and documents (without direct URLs for security)
        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.fullName,
                email: user.email,
                university: user.university,
                degree: user.degree,
                branch: user.branch,
                graduationYear: user.graduationYear,
                username: user.username,
                skills: user.skills || [],
                bio: user.bio || ''
            },
            documents: documents.map(doc => ({
                _id: doc._id,
                originalName: doc.originalName,
                category: doc.category,
                fileSize: doc.fileSize,
                uploadDate: doc.uploadDate,
                hasCloudStorage: !!doc.cloudinaryPublicId,
                isPublic: doc.isPublic
            }))
        });

    } catch (error) {
        console.error('Portfolio fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching portfolio'
        });
    }
});

// @route   GET /api/portfolio/:username/document/:docId
// @desc    Generate secure guest pass for portfolio document viewing
// @access  Public (but generates time-limited signed URL)
router.get('/:username/document/:docId', async (req, res) => {
    try {
        const { username, docId } = req.params;
        console.log('🎟️  Guest pass request for portfolio document:', docId);

        // Find user by username
        const user = await User.findOne({ username: username.toLowerCase() });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if portfolio is public
        if (!user.portfolioPublic) {
            return res.status(403).json({
                success: false,
                message: 'This portfolio is private'
            });
        }

        // Find document and verify it belongs to this user
        const document = await Document.findById(docId);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        if (document.userId.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Document does not belong to this portfolio'
            });
        }

        if (!document.cloudinaryPublicId) {
            return res.status(400).json({
                success: false,
                message: 'Document not available for secure viewing'
            });
        }

        // Generate 10-minute guest pass (signed URL)
        const fileExt = document.originalName.split('.').pop().toLowerCase();
        const expiresAt = Math.floor(Date.now() / 1000) + (10 * 60);

        const guestPassUrl = cloudinary.utils.private_download_url(
            document.cloudinaryPublicId,
            fileExt,
            {
                resource_type: 'image',
                expires_at: expiresAt,
                attachment: false
            }
        );

        console.log('✅ Generated guest pass (expires in 10 min)');

        res.json({
            success: true,
            guestPassUrl: guestPassUrl,
            fileName: document.originalName,
            expiresIn: '10 minutes',
            expiresAt: expiresAt
        });

    } catch (error) {
        console.error('Portfolio document view error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating secure document link'
        });
    }
});

// @route   GET /api/portfolio/:username/constellation
// @desc    Get 3D graph data for skill constellation
// @access  Public
router.get('/:username/constellation', async (req, res) => {
    try {
        const { username } = req.params;

        // Find user by username
        const user = await User.findOne({ username: username.toLowerCase() });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Fetch all projects for this user
        const projects = await Project.find({ userId: user._id }).lean();

        // Build graph data
        const nodes = [];
        const links = [];

        // Central "Me" node
        nodes.push({
            id: 'Me',
            group: 'user',
            val: 20,
            name: user.fullName || user.username
        });

        // Get unique skills from user
        const skills = user.skills || [];
        const skillSet = new Set(skills);

        // Add skill nodes and link to "Me"
        skillSet.forEach(skill => {
            nodes.push({
                id: skill,
                group: 'skill',
                val: 10,
                name: skill
            });
            links.push({
                source: 'Me',
                target: skill
            });
        });

        // Add project nodes and link to their tags
        projects.forEach(project => {
            const projectId = project.title;
            nodes.push({
                id: projectId,
                group: 'project',
                val: 15,
                name: project.title,
                githubLink: project.githubLink,
                description: project.description
            });

            // Link project to its tags (if tag exists in skills)
            if (project.tags && project.tags.length > 0) {
                project.tags.forEach(tag => {
                    if (skillSet.has(tag)) {
                        links.push({
                            source: projectId,
                            target: tag
                        });
                    }
                });
            }
        });

        console.log(`🌌 Constellation for ${username}: ${nodes.length} nodes, ${links.length} links`);

        res.json({
            success: true,
            nodes,
            links
        });
    } catch (error) {
        console.error('Constellation fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating constellation data'
        });
    }
});

module.exports = router;

