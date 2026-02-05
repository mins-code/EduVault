const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const axios = require('axios');

// Helper function to extract owner and repo from GitHub URL
const parseGitHubUrl = (url) => {
    try {
        const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (match) {
            return {
                owner: match[1],
                repo: match[2].replace(/\.git$/, '')
            };
        }
        return null;
    } catch (error) {
        return null;
    }
};

// Helper function to fetch GitHub repo metadata
const fetchGitHubMetadata = async (owner, repo) => {
    try {
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
            timeout: 5000,
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        const data = response.data;

        // Log the tags being pulled from GitHub
        console.log(`🏷️  GitHub Topics for ${owner}/${repo}:`, data.topics || []);
        console.log(`📊 Repo Stats - Stars: ${data.stargazers_count}, Forks: ${data.forks_count}`);

        return {
            title: data.name,
            description: data.description || '',
            stats: {
                stars: data.stargazers_count || 0,
                forks: data.forks_count || 0,
                lastCommit: data.pushed_at ? new Date(data.pushed_at) : null
            },
            tags: data.topics || []
        };
    } catch (error) {
        console.log('⚠️ GitHub API fetch failed:', error.message);
        return null;
    }
};

// Helper function to fetch commit stats from GitHub with retry logic
const fetchCommitStats = async (owner, repo) => {
    let retries = 3;

    while (retries > 0) {
        try {
            console.log(`📡 Fetching stats for ${owner}/${repo} (Attempts left: ${retries})`);

            // Endpoint: GET /repos/{owner}/{repo}/stats/commit_activity
            const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`, {
                timeout: 5000,
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            const weeks = response.data;

            if (Array.isArray(weeks)) {
                // Success! We have data.
                // We need the last 15 weeks of activity to show broader history

                let weeklyStats = [];

                // Take the last 15 weeks
                const recentWeeks = weeks.slice(-15);

                // Map to just the total commits for that week
                weeklyStats = recentWeeks.map(week => week.total);

                // If we have fewer than 15 weeks (new repo), pad with 0s at the start
                while (weeklyStats.length < 15) {
                    weeklyStats.unshift(0);
                }

                console.log(`📈 Fetched real weekly commit history for ${owner}/${repo}`);
                return weeklyStats;
            } else {
                // 202 Accepted but processing
                console.log(`⏳ GitHub stats calculating for ${owner}/${repo}...`);
            }

        } catch (error) {
            console.log(`⚠️ GitHub stats fetch error: ${error.message}`);
        }

        retries--;
        // Wait 1.5s before next try if we have retries left
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
    }

    console.log(`❌ Failed to fetch stats for ${owner}/${repo} after retries. Returning empty graph.`);
    return Array(15).fill(0);
};

// @route   GET /api/projects/user/:userId
// @desc    Get all projects for a specific user (public route for portfolio)
// @access  Public
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('📂 Public projects request for userId:', userId);

        const projects = await Project.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        console.log(`📊 Found ${projects.length} projects for user ${userId}`);

        res.json({
            success: true,
            projects
        });
    } catch (error) {
        console.error('Public projects fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching projects'
        });
    }
});

// @route   GET /api/projects
// @desc    Get all projects for authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
        }

        const projects = await Project.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            projects
        });
    } catch (error) {
        console.error('Projects fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching projects'
        });
    }
});

// @route   POST /api/projects
// @desc    Add new project with GitHub metadata
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const { githubLink, title, description, tags } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
        }

        if (!githubLink) {
            return res.status(400).json({
                success: false,
                message: 'GitHub link is required'
            });
        }

        // Parse GitHub URL
        const parsed = parseGitHubUrl(githubLink);
        if (!parsed) {
            return res.status(400).json({
                success: false,
                message: 'Invalid GitHub URL format'
            });
        }

        // Try to fetch metadata from GitHub
        const metadata = await fetchGitHubMetadata(parsed.owner, parsed.repo);
        // Fetch commit stats
        const activityGraph = await fetchCommitStats(parsed.owner, parsed.repo);

        const projectData = {
            userId,
            githubLink,
            title: title || metadata?.title || parsed.repo,
            description: description || metadata?.description || '',
            tags: tags || metadata?.tags || [],
            stats: metadata?.stats || { stars: 0, forks: 0, lastCommit: null },
            activityGraph: activityGraph
        };

        console.log(`📝 Project Data - Tags being saved:`, projectData.tags);
        console.log(`💡 Tip: Ensure these tags match your User Skills for galaxy connections!`);

        const project = new Project(projectData);
        await project.save();

        console.log(`✅ Project added: ${project.title} for user ${userId}`);
        console.log(`🔗 Final saved tags:`, project.tags);

        res.status(201).json({
            success: true,
            project
        });
    } catch (error) {
        console.error('Project creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating project'
        });
    }
});

// @route   PATCH /api/projects/:id
// @desc    Update project tags and metadata
// @access  Private
router.patch('/:id', auth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const { id } = req.params;
        const { tags, title, description } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
        }

        // Find and verify ownership
        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        if (project.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this project'
            });
        }

        // Update fields if provided
        if (tags !== undefined) project.tags = tags;
        if (title !== undefined) project.title = title;
        if (description !== undefined) project.description = description;

        await project.save();

        console.log(`✏️  Project updated: ${project.title}`);
        console.log(`🏷️  New tags:`, project.tags);

        res.json({
            success: true,
            project
        });
    } catch (error) {
        console.error('Project update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating project'
        });
    }
});

// @route   PATCH /api/projects/:id/sync
// @desc    Re-sync project with GitHub to fetch latest metadata
// @access  Private
router.patch('/:id/sync', auth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const { id } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
        }

        // Find and verify ownership
        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        if (project.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to sync this project'
            });
        }

        // Parse GitHub URL
        const parsed = parseGitHubUrl(project.githubLink);
        if (!parsed) {
            return res.status(400).json({
                success: false,
                message: 'Invalid GitHub URL in project'
            });
        }

        // Fetch fresh metadata from GitHub
        const metadata = await fetchGitHubMetadata(parsed.owner, parsed.repo);
        // Fetch fresh activity stats
        const activityGraph = await fetchCommitStats(parsed.owner, parsed.repo);

        if (metadata) {
            // Update project with fresh data
            project.title = metadata.title;
            project.description = metadata.description;
            project.tags = metadata.tags;
            project.stats = metadata.stats;
            project.activityGraph = activityGraph; // Update graph with real data

            await project.save();

            console.log(`🔄 Project synced: ${project.title}`);
            console.log(`🏷️  Updated tags:`, project.tags);

            res.json({
                success: true,
                project,
                message: 'Project synced successfully with GitHub'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch data from GitHub'
            });
        }
    } catch (error) {
        console.error('Project sync error:', error);
        res.status(500).json({
            success: false,
            message: 'Error syncing project'
        });
    }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project by ID
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const { id } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
        }

        // Find and verify ownership
        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        if (project.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this project'
            });
        }

        await Project.findByIdAndDelete(id);

        console.log(`🗑️ Project deleted: ${project.title}`);

        res.json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('Project deletion error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting project'
        });
    }
});

// @route   PATCH /api/projects/:id/visibility
// @desc    Toggle project visibility (public/private)
// @access  Private
router.patch('/:id/visibility', auth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const { id } = req.params;
        const { isPublic } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
        }

        // Find and verify ownership
        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        if (project.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to modify this project'
            });
        }

        // Update visibility
        project.isPublic = isPublic;
        await project.save();

        console.log(`👁️  Project visibility updated: ${project.title} - ${isPublic ? 'Public' : 'Private'}`);

        res.json({
            success: true,
            message: 'Project visibility updated',
            project
        });
    } catch (error) {
        console.error('Project visibility update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating project visibility'
        });
    }
});

module.exports = router;
