import { useState, useEffect } from 'react'
import { GitBranch, Plus, Star, Activity, Trash2, ExternalLink } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import api from '../api'

export default function CodeVault() {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [githubLink, setGithubLink] = useState('')
    const [adding, setAdding] = useState(false)

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
        <div className="min-h-screen flex page-transition">
            <Sidebar />

            <div className="flex-1 ml-64">
                <TopBar />

                <main
                    className="pt-20 min-h-screen"
                    style={{
                        background: 'linear-gradient(180deg, #0A0F1F 0%, #0B1220 50%, #020617 100%)',
                        backgroundAttachment: 'fixed'
                    }}
                >
                    <div className="p-12">
                        <div className="max-w-7xl mx-auto">
                            {/* Header */}
                            <div className="mb-12">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                                        <GitBranch className="w-8 h-8 text-cyan-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-4xl font-display font-bold tracking-tight text-white">
                                            💻 Code Vault
                                        </h3>
                                        <p className="text-slate-400 text-lg mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                            Manage your active repositories
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Terminal-style Input */}
                            <div
                                className="mb-12 p-8 rounded-2xl border"
                                style={{
                                    background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 0.85))',
                                    borderColor: 'rgba(6, 182, 212, 0.3)',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                                }}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="ml-4 text-slate-500 text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                        terminal
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                            $
                                        </span>
                                        <input
                                            type="text"
                                            value={githubLink}
                                            onChange={(e) => setGithubLink(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddProject()}
                                            placeholder="https://github.com/username/repo..."
                                            className="w-full px-4 pl-8 py-4 rounded-xl border bg-black/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
                                            style={{
                                                fontFamily: 'JetBrains Mono, monospace',
                                                borderColor: 'rgba(148, 163, 184, 0.2)'
                                            }}
                                            disabled={adding}
                                        />
                                    </div>
                                    <button
                                        onClick={handleAddProject}
                                        disabled={adding || !githubLink.trim()}
                                        className="px-6 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        style={{
                                            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                                            color: 'white',
                                            boxShadow: '0 4px 20px rgba(6, 182, 212, 0.3)'
                                        }}
                                    >
                                        <Plus className="w-5 h-5" />
                                        {adding ? 'Initializing...' : 'Initialize Repository'}
                                    </button>
                                </div>
                            </div>

                            {/* Loading State */}
                            {loading && (
                                <div className="text-center py-20">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
                                    <p className="text-cyan-400 mt-4" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                        LOADING REPOSITORIES...
                                    </p>
                                </div>
                            )}

                            {/* Empty State */}
                            {!loading && projects.length === 0 && (
                                <div className="text-center py-20">
                                    <GitBranch className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-500 text-lg" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                        No repositories initialized yet
                                    </p>
                                    <p className="text-slate-600 text-sm mt-2">
                                        Add your first GitHub repository to get started
                                    </p>
                                </div>
                            )}

                            {/* Project Cards Grid */}
                            {!loading && projects.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {projects.map((project) => {
                                        const activityLevel = getActivityLevel(project.activityGraph)
                                        const activityData = formatActivityData(project.activityGraph)

                                        return (
                                            <div
                                                key={project._id}
                                                className="group rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-2"
                                                style={{
                                                    background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 0.85))',
                                                    borderColor: 'rgba(148, 163, 184, 0.1)',
                                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                                                }}
                                            >
                                                {/* Header */}
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                                            <GitBranch className="w-5 h-5 text-cyan-400" />
                                                            {project.title}
                                                        </h4>
                                                        <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                                                            {project.description || 'No description available'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteProject(project._id)}
                                                        className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Tags */}
                                                {project.tags && project.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {project.tags.slice(0, 3).map((tag, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-2 py-1 rounded-md text-xs font-medium"
                                                                style={{
                                                                    background: 'rgba(6, 182, 212, 0.1)',
                                                                    color: '#22d3ee',
                                                                    borderColor: 'rgba(6, 182, 212, 0.3)',
                                                                    border: '1px solid'
                                                                }}
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Repository Metrics */}
                                                <div className="space-y-3 mb-4">
                                                    {/* Stars & Forks */}
                                                    <div className="flex items-center justify-between p-3 rounded-lg bg-black/20">
                                                        <div className="flex items-center gap-2">
                                                            <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                                                            <div>
                                                                <div className="text-sm font-semibold text-yellow-400">{project.stats.stars} Stars</div>
                                                                <div className="text-xs text-slate-500">Community appreciation</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-sm font-semibold text-slate-300">{project.stats.forks} Forks</div>
                                                            <div className="text-xs text-slate-500">Active contributors</div>
                                                        </div>
                                                    </div>

                                                    {/* Activity Level */}
                                                    <div className="p-3 rounded-lg bg-black/20">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Activity className="w-4 h-4" style={{ color: activityLevel.color }} />
                                                            <span className="text-sm font-semibold" style={{ color: activityLevel.color }}>
                                                                {activityLevel.intensity}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-slate-400">{activityLevel.description}</div>
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            Last updated: {formatLastCommit(project.stats.lastCommit)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Activity Graph (Time Capsule) */}
                                                <div
                                                    className="mb-4 p-3 rounded-lg"
                                                    style={{
                                                        background: 'rgba(0, 0, 0, 0.3)',
                                                        border: '1px solid rgba(6, 182, 212, 0.2)'
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs text-slate-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                            15-DAY COMMIT FREQUENCY
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            {activityLevel.description}
                                                        </span>
                                                    </div>
                                                    <ResponsiveContainer width="100%" height={50}>
                                                        <LineChart data={activityData}>
                                                            <Line
                                                                type="monotone"
                                                                dataKey="value"
                                                                stroke="#06b6d4"
                                                                strokeWidth={2}
                                                                dot={false}
                                                            />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                    <div className="text-xs text-slate-500 mt-2 text-center">
                                                        Shows daily commit activity over the past 15 days
                                                    </div>
                                                </div>

                                                {/* GitHub Link */}
                                                <a
                                                    href={project.githubLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all text-sm font-medium"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    View on GitHub
                                                </a>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
