import { useState, useEffect } from 'react'
import { GitBranch, Plus, Star, Activity, Trash2, ExternalLink, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import api from '../api'

export default function CodeVault() {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [githubLink, setGithubLink] = useState('')
    const [adding, setAdding] = useState(false)
    const [toast, setToast] = useState(null)

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            setLoading(true)
            const response = await api.get('/api/projects')
            if (response.data.success) {
                setProjects(response.data.projects)
            }
        } catch (error) {
            console.error('Projects fetch error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddProject = async () => {
        if (!githubLink.trim()) return

        try {
            setAdding(true)
            const response = await api.post('/api/projects', { githubLink })
            if (response.data.success) {
                setProjects([response.data.project, ...projects])
                setGithubLink('')
            }
        } catch (error) {
            console.error('Add project error:', error)
            alert(error.response?.data?.message || 'Failed to add project')
        } finally {
            setAdding(false)
        }
    }

    const handleDeleteProject = async (id) => {
        if (!confirm('Are you sure you want to remove this project?')) return

        try {
            const response = await api.delete(`/api/projects/${id}`)
            if (response.data.success) {
                setProjects(projects.filter(p => p._id !== id))
            }
        } catch (error) {
            console.error('Delete project error:', error)
            alert('Failed to delete project')
        }
    }

    const handleToggleVisibility = async (id, currentVisibility) => {
        try {
            const response = await api.patch(`/api/projects/${id}/visibility`, {
                isPublic: !currentVisibility
            })
            if (response.data.success) {
                setProjects(projects.map(p =>
                    p._id === id ? { ...p, isPublic: !currentVisibility } : p
                ))

                // Show toast notification
                const newStatus = !currentVisibility
                setToast({
                    message: newStatus ? '✅ Now publicly visible on portfolio' : '🔒 Hidden from portfolio',
                    type: newStatus ? 'success' : 'info'
                })
                setTimeout(() => setToast(null), 3000)
            }
        } catch (error) {
            console.error('Toggle visibility error:', error)
            setToast({ message: '❌ Failed to update visibility', type: 'error' })
            setTimeout(() => setToast(null), 3000)
        }
    }

    const formatActivityData = (activityGraph) => {
        return activityGraph.map((value, index) => ({ index, value }))
    }

    const getActivityLevel = (activityGraph) => {
        const avg = activityGraph.reduce((a, b) => a + b, 0) / activityGraph.length
        if (avg > 7) return {
            label: 'High Activity',
            color: '#22c55e',
            description: `${avg.toFixed(1)} commits/day avg`,
            intensity: 'Very Active'
        }
        if (avg > 4) return {
            label: 'Medium Activity',
            color: '#eab308',
            description: `${avg.toFixed(1)} commits/day avg`,
            intensity: 'Moderately Active'
        }
        return {
            label: 'Low Activity',
            color: '#64748b',
            description: `${avg.toFixed(1)} commits/day avg`,
            intensity: 'Less Active'
        }
    }

    const formatLastCommit = (dateString) => {
        if (!dateString) return 'Unknown'
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now - date)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return 'Yesterday'
        if (diffDays < 7) return `${diffDays} days ago`
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
        return `${Math.floor(diffDays / 365)} years ago`
    }

    return (
        <div className="flex h-screen bg-bg-primary overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden ml-64">
                <TopBar />
                <main className="flex-1 overflow-y-auto p-8 pt-24">
                    <div className="w-full">
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold text-text-primary mb-2 flex items-center gap-3">
                                <GitBranch className="w-10 h-10 text-accent-cyan" />
                                Code Vault
                            </h1>
                            <p className="text-text-secondary">
                                Showcase your GitHub projects on your portfolio
                            </p>
                        </div>

                        {/* Add Project Section */}
                        <div className="mb-8 p-6 rounded-xl border border-cyan-500/20 bg-slate-900/60 backdrop-blur-sm shadow-lg shadow-cyan-500/5">
                            <h2 className="text-xl font-semibold text-text-primary mb-4">Add New Project</h2>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    value={githubLink}
                                    onChange={(e) => setGithubLink(e.target.value)}
                                    placeholder="Paste GitHub repository URL..."
                                    className="flex-1 px-4 py-3 rounded-lg bg-slate-950/80 border-2 border-slate-700/50 text-text-primary placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddProject()}
                                />
                                <button
                                    onClick={handleAddProject}
                                    disabled={adding || !githubLink.trim()}
                                    className="px-6 py-3 rounded-lg bg-accent-cyan hover:bg-accent-cyan/90 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    {adding ? 'Adding...' : 'Add Project'}
                                </button>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="text-center py-12">
                                <p className="text-text-secondary">Loading projects...</p>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && projects.length === 0 && (
                            <div className="text-center py-12">
                                <GitBranch className="w-16 h-16 text-text-muted mx-auto mb-4" />
                                <p className="text-text-secondary mb-2">No projects yet</p>
                                <p className="text-text-muted text-sm">Add your first GitHub repository to get started</p>
                            </div>
                        )}

                        {/* Project Cards Grid - HOLOGRAPHIC HUD DESIGN */}
                        {!loading && projects.length > 0 && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                {projects.map((project) => {
                                    const activityLevel = getActivityLevel(project.activityGraph)
                                    const activityData = formatActivityData(project.activityGraph)

                                    return (
                                        <div
                                            key={project._id}
                                            className="relative w-full h-[420px] bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden group hover:border-cyan-500/50 transition-all duration-300"
                                        >
                                            {/* Hover Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                            {/* Content Layer */}
                                            <div className="relative z-10 p-6 h-full flex flex-col pb-32">
                                                {/* Header */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1 min-w-0 pr-2">
                                                        <h4 className="text-white font-bold text-lg tracking-wide group-hover:text-cyan-400 transition-colors mb-2 flex items-center gap-2 truncate">
                                                            <GitBranch className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                                                            <span className="truncate">{project.title}</span>
                                                        </h4>
                                                        <p className="text-sm text-slate-400 line-clamp-2">
                                                            {project.description || 'No description available'}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2 flex-shrink-0">
                                                        <button
                                                            onClick={() => handleToggleVisibility(project._id, project.isPublic)}
                                                            className={`p-2 rounded-lg transition-all ${project.isPublic
                                                                ? 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'
                                                                : 'bg-slate-700/50 text-slate-500 hover:bg-slate-700'
                                                                }`}
                                                            title={project.isPublic ? 'Public (Click to make private)' : 'Private (Click to make public)'}
                                                        >
                                                            {project.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    const btn = document.getElementById(`sync-${project._id}`)
                                                                    if (btn) btn.classList.add('animate-spin')

                                                                    await api.patch(`/api/projects/${project._id}/sync`)
                                                                    fetchProjects()
                                                                } catch (e) {
                                                                    console.error(e)
                                                                    alert('Sync failed')
                                                                }
                                                            }}
                                                            id={`sync-${project._id}`}
                                                            className="p-2 rounded-lg hover:bg-cyan-500/10 text-slate-500 hover:text-cyan-400 transition-all"
                                                            title="Sync with GitHub"
                                                        >
                                                            <RefreshCw className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProject(project._id)}
                                                            className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Tags */}
                                                {project.tags && project.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {project.tags.slice(0, 3).map((tag, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-2 py-1 rounded-md text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Stats Pills - HUD Style */}
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                                        <Star className="w-3.5 h-3.5" fill="currentColor" />
                                                        <span className="text-xs font-semibold">{project.stats.stars}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border" style={{
                                                        background: `${activityLevel.color}15`,
                                                        borderColor: `${activityLevel.color}30`,
                                                        color: activityLevel.color
                                                    }}>
                                                        <Activity className="w-3.5 h-3.5" />
                                                        <span className="text-xs font-semibold">{activityLevel.intensity}</span>
                                                    </div>
                                                </div>

                                                {/* Additional Info */}
                                                <div className="space-y-2.5 mb-5 text-xs text-slate-400">
                                                    <div className="flex items-center justify-between">
                                                        <span>Forks:</span>
                                                        <span className="text-slate-300 font-semibold">{project.stats.forks}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span>Last updated:</span>
                                                        <span className="text-slate-300 font-semibold">{formatLastCommit(project.stats.lastCommit)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span>Commit frequency:</span>
                                                        <span className="text-slate-300 font-semibold">{activityLevel.description.replace('day', 'week')}</span>
                                                    </div>
                                                </div>

                                                {/* View Source Button */}
                                                <a
                                                    href={project.githubLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 hover:border-cyan-500/40 transition-all text-sm font-medium mt-auto"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    View Source
                                                </a>
                                            </div>

                                            {/* Immersive Area Chart - Bottom Landscape */}
                                            <div className="absolute bottom-0 left-0 right-0 h-32 w-full opacity-60 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-auto">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={activityData}>
                                                        <defs>
                                                            <linearGradient id={`colorGlow-${project._id}`} x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                                                                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                                                border: '1px solid rgba(6, 182, 212, 0.3)',
                                                                borderRadius: '8px',
                                                                padding: '8px 12px',
                                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
                                                            }}
                                                            labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}
                                                            itemStyle={{ color: '#06b6d4', fontSize: '14px', fontWeight: '600' }}
                                                            formatter={(value) => [`${value} commits`, 'Activity']}
                                                            labelFormatter={(index) => `Week ${index + 1}`}
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="value"
                                                            stroke="#06b6d4"
                                                            strokeWidth={2}
                                                            fill={`url(#colorGlow-${project._id})`}
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </main>

                {/* Toast Notification */}
                {toast && (
                    <div className="fixed top-24 right-8 z-50">
                        <div className={`px-6 py-3 rounded-lg shadow-lg border-2 transition-all ${toast.type === 'success' ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' :
                                toast.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-400' :
                                    'bg-slate-700/90 border-slate-600 text-slate-300'
                            }`}>
                            <p className="text-sm font-medium">{toast.message}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
