import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import { ShieldCheck, FileText, Image as ImageIcon, ExternalLink, Download, GraduationCap, Briefcase, Code, Award, FileDown, Mail, GitBranch, Star, Activity, Sparkles, CheckCircle, Trophy, Code2, X, Copy } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import api from '../api'
import PortfolioPDF from './PortfolioPDF'
import SkillConstellation from './SkillConstellation'

export default function Portfolio() {
    const { username } = useParams()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [portfolioData, setPortfolioData] = useState(null)
    const [codeProjects, setCodeProjects] = useState([])
    const [constellationData, setConstellationData] = useState(null)
    const [viewMode, setViewMode] = useState('list') // 'list' or 'galaxy'
    const [isRecruiter, setIsRecruiter] = useState(false)
    const [emailCopied, setEmailCopied] = useState(false)
    const [showContactModal, setShowContactModal] = useState(false)
    const resumeRef = useRef()

    useEffect(() => {
        const recruiterToken = localStorage.getItem('recruiterToken')
        setIsRecruiter(!!recruiterToken)
        fetchPortfolio()
        fetchConstellation(username)
    }, [username])

    const fetchPortfolio = async () => {
        try {
            const response = await api.get(`/api/portfolio/${username}`)
            if (response.data.success) {
                setPortfolioData(response.data)
                console.log('👤 Portfolio user data:', response.data.user)
                // Fetch projects for this user
                // Use projects from portfolio response (already filtered for public)
                if (response.data.projects) {
                    setCodeProjects(response.data.projects)
                    console.log('✅ Public projects loaded:', response.data.projects.length)
                } else if (response.data.user?._id) {
                    console.log('⚠️ No projects in response, falling back to fetch...')
                    fetchProjects(response.data.user._id)
                }
            }
        } catch (error) {
            console.error('Portfolio fetch error:', error)
            setError(error.response?.data?.message || 'Failed to load portfolio')
        } finally {
            setLoading(false)
        }
    }

    const fetchProjects = async (userId) => {
        try {
            console.log('🔍 Fetching projects for userId:', userId)
            const response = await api.get(`/api/projects/user/${userId}`)
            console.log('📦 Projects response:', response.data)
            if (response.data.success) {
                setCodeProjects(response.data.projects)
                console.log('✅ Code projects set:', response.data.projects.length)
            }
        } catch (error) {
            console.error('Projects fetch error:', error)
        }
    }

    const fetchConstellation = async (username) => {
        try {
            console.log('🌌 Fetching constellation for:', username)
            const response = await api.get(`/api/portfolio/${username}/constellation`)
            if (response.data.success) {
                setConstellationData({
                    nodes: response.data.nodes,
                    links: response.data.links
                })
                console.log('✅ Constellation loaded:', response.data.nodes.length, 'nodes')
            }
        } catch (error) {
            console.error('Constellation fetch error:', error)
        }
    }

    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase()
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp']
        return imageExts.includes(ext) ? ImageIcon : FileText
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        })
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

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const handleViewDocument = async (doc) => {
        const newWindow = window.open('', '_blank')

        if (newWindow) {
            newWindow.document.write('<div style="color:white;background:#0f172a;height:100vh;display:flex;justify-content:center;align-items:center;font-family:Inter,sans-serif;font-size:18px;">Securing Connection...</div>')
        }

        try {
            console.log('Requesting guest pass for:', doc.originalName)
            if (doc.hasCloudStorage) {
                const response = await api.get(`/api/portfolio/${username}/document/${doc._id}`)
                if (response.data.success) {
                    console.log('Guest pass generated')
                    if (newWindow) {
                        newWindow.location.href = response.data.guestPassUrl
                    } else {
                        window.open(response.data.guestPassUrl, '_blank')
                    }
                } else {
                    if (newWindow) newWindow.close()
                    alert('Failed to generate secure document link')
                }
            } else {
                if (newWindow) newWindow.close()
                alert('This document needs to be re-uploaded for secure viewing')
            }
        } catch (error) {
            console.error('View error:', error)
            if (newWindow) newWindow.close()
            alert('Failed to open document. Please try again.')
        }
    }

    const handleDownloadDocument = async (doc) => {
        try {
            console.log('Requesting download guest pass for:', doc.originalName)
            if (doc.hasCloudStorage) {
                const response = await api.get(`/api/portfolio/${username}/document/${doc._id}`)
                if (response.data.success) {
                    const link = document.createElement('a')
                    link.href = response.data.guestPassUrl
                    link.download = doc.originalName
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    console.log('Download initiated')
                } else {
                    alert('Failed to generate download link')
                }
            } else {
                alert('This document needs to be re-uploaded for secure download')
            }
        } catch (error) {
            console.error('Download error:', error)
            alert('Failed to download document. Please try again.')
        }
    }

    const handleShareDocument = async (doc) => {
        try {
            console.log('Generating share link for:', doc.originalName)
            if (doc.hasCloudStorage) {
                const response = await api.get(`/api/portfolio/${username}/document/${doc._id}`)
                if (response.data.success) {
                    const shareUrl = response.data.guestPassUrl
                    const shareData = {
                        title: doc.originalName,
                        text: `View document: ${doc.originalName} from ${portfolioData?.user?.name}'s portfolio (Link expires in 10 minutes)`,
                        url: shareUrl
                    }
                    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                        await navigator.share(shareData)
                        console.log('Shared via Web Share API')
                    } else {
                        await navigator.clipboard.writeText(shareUrl)
                        alert('Link copied to clipboard! (Expires in 10 minutes)')
                        console.log('Link copied to clipboard')
                    }
                } else {
                    alert('Failed to generate share link')
                }
            } else {
                alert('This document needs to be re-uploaded for secure sharing')
            }
        } catch (error) {
            console.error('Share error:', error)
            if (error.name !== 'AbortError') {
                alert('Failed to share document. Please try again.')
            }
        }
    }

    const handleDownloadPortfolio = useReactToPrint({
        contentRef: resumeRef,
        documentTitle: `${portfolioData?.user?.username || 'Portfolio'}_Portfolio`,
        onAfterPrint: () => console.log('Portfolio PDF downloaded successfully')
    })

    const handleContact = () => {
        if (!portfolioData?.user) return
        setShowContactModal(true)
    }

    const copyToClipboard = async (text, type = 'text') => {
        try {
            await navigator.clipboard.writeText(text)
            // You might want to add a toast here in the future
            return true
        } catch (err) {
            console.error('Failed to copy:', err)
            return false
        }
    }

    const getEmailContent = () => {
        const studentName = portfolioData?.user?.name || 'Student'
        let companyName = 'Our Company'
        try {
            const recruiterData = JSON.parse(localStorage.getItem('recruiter') || '{}')
            companyName = recruiterData.companyName || 'Our Company'
        } catch (e) { }

        const subject = `Job Opportunity from ${companyName}`
        const body = `Hi ${studentName},\n\nI came across your portfolio on EduVault and was impressed by your background.\n\nI'd love to discuss potential opportunities at ${companyName}.\n\nBest regards`

        return { subject, body, email: portfolioData?.user?.email }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{
                background: 'linear-gradient(180deg, #0A0F1F 0%, #0B1220 50%, #020617 100%)'
            }}>
                <p className="text-text-secondary text-lg">Loading portfolio...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{
                background: 'linear-gradient(180deg, #0A0F1F 0%, #0B1220 50%, #020617 100%)'
            }}>
                <div className="text-center">
                    <p className="text-text-secondary text-lg mb-4">{error}</p>
                    <a href="/" className="btn-primary">Go Home</a>
                </div>
            </div>
        )
    }

    const { user, documents } = portfolioData

    const academics = documents.filter(doc => doc.category === 'Academics')
    const internships = documents.filter(doc => doc.category === 'Internships')
    const projects = documents.filter(doc => doc.category === 'Projects')
    const certifications = documents.filter(doc => doc.category === 'Certifications')

    const timelineItems = [...internships, ...academics].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))

    return (
        <div className="min-h-screen page-transition relative overflow-hidden" style={{
            background: 'linear-gradient(180deg, #0A0F1F 0%, #0B1220 25%, #0D1525 50%, #0B1220 75%, #020617 100%)',
            backgroundAttachment: 'fixed'
        }}>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse" style={{
                    background: 'radial-gradient(circle, #1E3A5F 0%, transparent 70%)',
                    top: '5%',
                    left: '10%',
                    animation: 'float 20s ease-in-out infinite'
                }} />
                <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-25 animate-pulse" style={{
                    background: 'radial-gradient(circle, #1A2F4A 0%, transparent 70%)',
                    top: '30%',
                    right: '5%',
                    animation: 'float 25s ease-in-out infinite reverse'
                }} />
                <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse" style={{
                    background: 'radial-gradient(circle, #0B1220 0%, transparent 70%)',
                    bottom: '20%',
                    left: '50%',
                    animation: 'float 30s ease-in-out infinite'
                }} />
                <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse" style={{
                    background: 'radial-gradient(circle, #121A2F 0%, transparent 70%)',
                    top: '60%',
                    left: '20%',
                    animation: 'float 35s ease-in-out infinite reverse'
                }} />
            </div>

            <div className="max-w-7xl mx-auto px-8 py-20 relative z-10">
                <div className="mb-24">
                    <div className="max-w-4xl mx-auto p-12 rounded-vault-lg border backdrop-blur-xl" style={{
                        background: 'rgba(15, 23, 42, 0.65)',
                        borderColor: 'rgba(56, 189, 248, 0.3)',
                        boxShadow: '0 0 40px rgba(56, 189, 248, 0.15), inset 0 0 60px rgba(56, 189, 248, 0.05)'
                    }}>
                        <div className="text-center">
                            <h1 className="text-6xl font-semibold tracking-tight text-text-primary mb-4 flex items-center justify-center gap-4" style={{
                                fontFamily: 'Outfit, sans-serif',
                                fontWeight: 600,
                                textShadow: '0 2px 20px rgba(56, 189, 248, 0.3), 0 4px 40px rgba(45, 212, 191, 0.2)'
                            }}>
                                {user.name}
                                {documents.length > 0 && (
                                    <ShieldCheck className="w-12 h-12 text-accent-teal" strokeWidth={2.5} style={{
                                        filter: 'drop-shadow(0 0 12px rgba(45, 212, 191, 0.6))'
                                    }} />
                                )}
                            </h1>

                            <p className="text-xl text-text-secondary mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {user.degree} • {user.branch}
                            </p>
                            <p className="text-lg text-text-muted mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {user.university} • Class of {user.graduationYear}
                            </p>

                            {/* Skills & Expertise Section */}
                            {user.skills && user.skills.length > 0 && (
                                <div className="mb-8">
                                    {/* Section Header with Toggle */}
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-2xl font-semibold text-white">Skills & Expertise</h3>
                                        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                                            <button
                                                onClick={() => setViewMode('list')}
                                                className={`px-4 py-2 text-sm rounded transition-all duration-200 ${viewMode === 'list'
                                                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                                                    : 'text-slate-400 hover:text-white'
                                                    }`}
                                            >
                                                List
                                            </button>
                                            <button
                                                onClick={() => setViewMode('galaxy')}
                                                className={`px-4 py-2 text-sm rounded transition-all duration-200 flex items-center gap-2 ${viewMode === 'galaxy'
                                                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                                                    : 'text-slate-400 hover:text-white'
                                                    }`}
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                Galaxy 3D
                                            </button>
                                            <button
                                                onClick={() => setViewMode('badges')}
                                                className={`px-4 py-2 text-sm rounded transition-all duration-200 flex items-center gap-2 ${viewMode === 'badges'
                                                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                                                    : 'text-slate-400 hover:text-white'
                                                    }`}
                                            >
                                                <ShieldCheck className="w-4 h-4" />
                                                Verified
                                            </button>
                                        </div>
                                    </div>

                                    {/* List View */}
                                    {viewMode === 'list' && (
                                        <div className="flex flex-wrap justify-center gap-3">
                                            {user.skills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                                                    style={{
                                                        background: 'rgba(15, 23, 42, 0.6)',
                                                        borderColor: 'rgba(34, 211, 238, 0.2)',
                                                        color: '#22d3ee',
                                                    }}
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Galaxy View */}
                                    {viewMode === 'galaxy' && constellationData && (
                                        <div className="relative w-full h-[600px] bg-slate-900/40 border border-cyan-500/30 rounded-2xl overflow-hidden backdrop-blur-sm">
                                            <SkillConstellation graphData={constellationData} />

                                            {/* Holographic Overlays */}
                                            <div className="absolute inset-0 holo-vignette"></div>
                                            <div className="absolute inset-0 holo-scanlines opacity-10"></div>

                                            {/* Corner Accents */}
                                            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-400/50" />
                                            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-400/50" />
                                            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-400/50" />
                                            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-400/50" />

                                            {/* Status Label */}
                                            <div className="absolute bottom-4 right-4 text-xs text-cyan-500 font-mono flex items-center gap-2">
                                                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                                                INTERACTIVE SYSTEM
                                            </div>
                                        </div>
                                    )}

                                    {/* Badges View */}
                                    {viewMode === 'badges' && (
                                        <div className="min-h-[200px] flex items-center justify-center">
                                            {user.skillStats && Object.keys(user.skillStats).length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                                                    {Object.entries(user.skillStats).map(([lang, stat]) => {
                                                        const badgeColors = {
                                                            Beginner: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]' },
                                                            Intermediate: { bg: 'bg-blue-500/5', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.1)]' },
                                                            Expert: { bg: 'bg-purple-500/5', border: 'border-purple-500/20', text: 'text-purple-400', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.1)]' }
                                                        }
                                                        const colors = badgeColors[stat.level] || badgeColors.Beginner

                                                        const displayLang = {
                                                            'javascript': 'JavaScript',
                                                            'python': 'Python',
                                                            'java': 'Java',
                                                            'cpp': 'C++'
                                                        }[lang] || lang

                                                        return (
                                                            <div key={lang} className={`relative group px-6 py-6 rounded-xl border ${colors.bg} ${colors.border} ${colors.glow} transition-all duration-300 hover:-translate-y-1 hover:border-opacity-50`}>
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <div className={`p-2 rounded-lg ${colors.bg} border ${colors.border}`}>
                                                                        <Code2 className={`w-5 h-5 ${colors.text}`} />
                                                                    </div>
                                                                    <div className={`text-xs font-bold tracking-wider px-2 py-1 rounded-full border ${colors.border} ${colors.text} bg-slate-950/30`}>
                                                                        {stat.level.toUpperCase()}
                                                                    </div>
                                                                </div>

                                                                <div className="text-left">
                                                                    <h4 className="text-xl font-bold text-white mb-1 tracking-tight">
                                                                        {displayLang}
                                                                    </h4>
                                                                    <p className="text-sm text-slate-400 font-mono">
                                                                        Verified Capability
                                                                    </p>
                                                                </div>

                                                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-slate-500">
                                                                    <CheckCircle className={`w-3 h-3 ${colors.text}`} />
                                                                    <span>{stat.count} Challenges Solved</span>
                                                                </div>

                                                                {/* Holographic shine */}
                                                                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                                                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-center text-slate-500 py-12">
                                                    <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                                    <p>No verified skills yet. Solve challenges to earn badges!</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Bio Section */}
                            {user.bio && (
                                <p className="text-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed" style={{
                                    fontFamily: 'Inter, sans-serif'
                                }}>
                                    {user.bio}
                                </p>
                            )}

                            <div className="flex items-center justify-center gap-8 mt-8">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-accent-cyan">{documents.length}</p>
                                    <p className="text-sm text-text-muted">Documents</p>
                                </div>
                                <div className="w-px h-12 bg-border-subtle" />
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-accent-teal">{certifications.length}</p>
                                    <p className="text-sm text-text-muted">Certifications</p>
                                </div>
                                <div className="w-px h-12 bg-border-subtle" />
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-accent-violet">{projects.length}</p>
                                    <p className="text-sm text-text-muted">Projects</p>
                                </div>
                            </div>

                            {isRecruiter && (
                                <div className="mt-8">
                                    <button
                                        onClick={handleContact}
                                        className="inline-flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 hover:shadow-xl hover:scale-105"
                                        style={{
                                            background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)'
                                        }}
                                    >
                                        <Mail className="w-5 h-5" />
                                        Contact Candidate
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {documents.length === 0 ? (
                    <div className="text-center py-24">
                        <p className="text-lg text-text-secondary" style={{ fontFamily: 'Inter, sans-serif' }}>
                            This portfolio is being built. Check back soon!
                        </p>
                    </div>
                ) : (
                    <>
                        {timelineItems.length > 0 && (
                            <div className="mb-32">
                                <h2 className="text-4xl font-semibold tracking-tight text-text-primary mb-16 text-center" style={{
                                    fontFamily: 'Outfit, sans-serif'
                                }}>
                                    Experience Timeline
                                </h2>

                                <div className="max-w-4xl mx-auto relative">
                                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -ml-px" style={{
                                        background: 'linear-gradient(180deg, transparent, #2DD4BF, transparent)',
                                        boxShadow: '0 0 10px rgba(45, 212, 191, 0.5)'
                                    }} />

                                    {timelineItems.map((doc, index) => {
                                        const FileIcon = getFileIcon(doc.originalName)
                                        const isLeft = index % 2 === 0

                                        return (
                                            <div key={doc._id} className="relative mb-16">
                                                <div className={`flex items-center ${isLeft ? 'justify-end pr-8' : 'justify-start pl-8'}`}>
                                                    <div className="absolute left-1/2 -ml-3 w-6 h-6 rounded-full bg-accent-teal" style={{
                                                        boxShadow: '0 0 20px rgba(45, 212, 191, 0.8), 0 0 40px rgba(45, 212, 191, 0.4)'
                                                    }} />

                                                    <div className={`w-5/12 p-6 rounded-vault-lg border transition-all duration-vault hover:-translate-y-2 hover:shadow-vault-lg cursor-pointer ${isLeft ? 'text-right' : 'text-left'}`}
                                                        style={{
                                                            background: 'linear-gradient(145deg, #0F172A, #020617)',
                                                            borderColor: 'rgba(148, 163, 184, 0.08)'
                                                        }}
                                                        onClick={() => handleViewDocument(doc)}
                                                    >
                                                        <div className={`flex items-start gap-4 ${isLeft ? 'flex-row-reverse' : 'flex-row'}`}>
                                                            <div className={`w-12 h-12 rounded-vault flex items-center justify-center flex-shrink-0 ${doc.category === 'Internships' ? 'bg-accent-teal/10' : 'bg-accent-cyan/10'}`}>
                                                                {doc.category === 'Internships' ? (
                                                                    <Briefcase className="w-6 h-6 text-accent-teal" strokeWidth={2} />
                                                                ) : (
                                                                    <GraduationCap className="w-6 h-6 text-accent-cyan" strokeWidth={2} />
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="text-base font-medium text-text-primary mb-2" style={{
                                                                    fontFamily: 'Outfit, sans-serif'
                                                                }}>
                                                                    {doc.derivedTitle || doc.originalName}
                                                                </h3>
                                                                {doc.derivedDescription && (
                                                                    <p className="text-xs text-text-muted mb-2 line-clamp-2" style={{
                                                                        fontFamily: 'JetBrains Mono, monospace'
                                                                    }}>
                                                                        {doc.derivedDescription}
                                                                    </p>
                                                                )}
                                                                <p className="text-sm text-text-muted mb-1" style={{
                                                                    fontFamily: 'JetBrains Mono, monospace'
                                                                }}>
                                                                    {formatDate(doc.uploadDate)}
                                                                </p>
                                                                <span className={`inline-block px-2 py-1 rounded text-xs ${doc.category === 'Internships'
                                                                    ? 'bg-accent-teal/10 text-accent-teal'
                                                                    : 'bg-accent-cyan/10 text-accent-cyan'
                                                                    }`}>
                                                                    {doc.category}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {projects.length > 0 && (
                            <div className="mb-32">
                                <h2 className="text-4xl font-semibold tracking-tight text-text-primary mb-16 text-center" style={{
                                    fontFamily: 'Outfit, sans-serif'
                                }}>
                                    Project Showcase
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {projects.map((doc, index) => {
                                        const FileIcon = getFileIcon(doc.originalName)
                                        return (
                                            <div
                                                key={doc._id}
                                                className="rounded-vault-lg p-6 border transition-all duration-vault hover:-translate-y-2 hover:shadow-vault-lg"
                                                style={{
                                                    background: 'linear-gradient(145deg, #0F172A, #020617)',
                                                    borderColor: 'rgba(148, 163, 184, 0.08)',
                                                    height: index % 3 === 0 ? '320px' : '280px'
                                                }}
                                            >
                                                <div className="flex flex-col h-full">
                                                    <div className="w-14 h-14 rounded-vault bg-accent-violet/10 flex items-center justify-center mb-4">
                                                        <Code className="w-7 h-7 text-accent-violet" strokeWidth={2} />
                                                    </div>

                                                    <h3 className="text-lg font-medium text-text-primary mb-3 line-clamp-2" style={{
                                                        fontFamily: 'Outfit, sans-serif'
                                                    }}>
                                                        {doc.originalName}
                                                    </h3>

                                                    <p className="text-sm text-text-muted mb-2" style={{
                                                        fontFamily: 'JetBrains Mono, monospace'
                                                    }}>
                                                        {formatDate(doc.uploadDate)}
                                                    </p>

                                                    {doc.derivedDescription && (
                                                        <p className="text-sm text-text-secondary mb-3 line-clamp-3" style={{
                                                            fontFamily: 'JetBrains Mono, monospace'
                                                        }}>
                                                            {doc.derivedDescription}
                                                        </p>
                                                    )}

                                                    <div className="mt-auto space-y-2">
                                                        <button
                                                            onClick={() => handleViewDocument(doc)}
                                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-vault bg-violet-600/10 border border-violet-500/30 text-violet-400 hover:bg-violet-600/20 transition-all duration-vault"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                            <span className="text-sm font-medium">Live Preview</span>
                                                        </button>

                                                        <div className="grid grid-cols-2 gap-2">
                                                            <button
                                                                onClick={() => handleDownloadDocument(doc)}
                                                                className="flex items-center justify-center gap-2 px-3 py-2 rounded-vault bg-cyan-600/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-600/20 transition-all duration-vault"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                                <span className="text-xs font-medium">Download</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleShareDocument(doc)}
                                                                className="flex items-center justify-center gap-2 px-3 py-2 rounded-vault bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/20 transition-all duration-vault"
                                                            >
                                                                <ExternalLink className="w-4 h-4" />
                                                                <span className="text-xs font-medium">Share</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {certifications.length > 0 && (
                            <div className="mb-32">
                                <h2 className="text-4xl font-semibold tracking-tight text-text-primary mb-16 text-center" style={{
                                    fontFamily: 'Outfit, sans-serif'
                                }}>
                                    Certifications
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {certifications.map((doc) => {
                                        const FileIcon = getFileIcon(doc.originalName)
                                        return (
                                            <div
                                                key={doc._id}
                                                className="group rounded-vault-lg p-6 border transition-all duration-vault cursor-pointer"
                                                style={{
                                                    background: 'linear-gradient(145deg, #0F172A, #020617)',
                                                    borderColor: 'rgba(148, 163, 184, 0.08)'
                                                }}
                                                onClick={() => handleViewDocument(doc)}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.05)'
                                                    e.currentTarget.style.boxShadow = '0 0 40px rgba(250, 204, 21, 0.3)'
                                                    e.currentTarget.style.borderColor = 'rgba(250, 204, 21, 0.4)'
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)'
                                                    e.currentTarget.style.boxShadow = 'none'
                                                    e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.08)'
                                                }}
                                            >
                                                <div className="w-16 h-16 rounded-vault bg-yellow-500/10 flex items-center justify-center mb-5">
                                                    <Award className="w-8 h-8 text-yellow-400" strokeWidth={2} />
                                                </div>

                                                <h3 className="text-lg font-medium text-text-primary mb-2 line-clamp-2" style={{
                                                    fontFamily: 'Outfit, sans-serif',
                                                    minHeight: '3.5rem'
                                                }}>
                                                    {doc.derivedTitle || doc.originalName}
                                                </h3>

                                                {doc.derivedDescription && (
                                                    <p className="text-sm text-text-muted mb-3 line-clamp-3" style={{
                                                        fontFamily: 'JetBrains Mono, monospace'
                                                    }}>
                                                        {doc.derivedDescription}
                                                    </p>
                                                )}

                                                <div className="space-y-2">
                                                    <p className="text-sm text-text-secondary" style={{
                                                        fontFamily: 'JetBrains Mono, monospace'
                                                    }}>
                                                        Issued: {formatDate(doc.uploadDate)}
                                                    </p>
                                                    <p className="text-sm text-text-muted" style={{
                                                        fontFamily: 'JetBrains Mono, monospace'
                                                    }}>
                                                        {formatFileSize(doc.fileSize)}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Open Source / Code Section */}
                        {console.log('🎨 Rendering check - codeProjects:', codeProjects)}
                        {codeProjects && codeProjects.length > 0 && (
                            <div className="mb-20">
                                <div className="flex items-center gap-4 mb-12">
                                    <div className="p-4 rounded-vault-lg bg-cyan-500/10 border border-cyan-500/30">
                                        <GitBranch className="w-8 h-8 text-cyan-400" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-display font-bold tracking-tight text-white">
                                            Open Source / Code
                                        </h2>
                                        <p className="text-text-muted mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                            Active repositories and contributions
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {codeProjects.map((project) => {
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
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-white font-bold text-lg tracking-wide group-hover:text-cyan-400 transition-colors mb-2 flex items-center gap-2 truncate">
                                                                <GitBranch className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                                                                <span className="truncate">{project.title}</span>
                                                            </h4>
                                                            <p className="text-sm text-slate-400 line-clamp-2">
                                                                {project.description || 'No description available'}
                                                            </p>
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
                                                            <span className="text-slate-300 font-semibold">{activityLevel.description}</span>
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
                                                                labelFormatter={(index) => `Day ${index + 1}`}
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
                            </div>
                        )}
                    </>
                )}

                <div className="text-center pt-16 border-t border-border-subtle">
                    <p className="text-sm text-text-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Powered by EduVault • Secure Document Management
                    </p>
                </div>
            </div>

            <button
                onClick={handleDownloadPortfolio}
                className="fixed bottom-8 right-8 px-6 py-4 rounded-full font-semibold transition-all duration-vault hover:scale-105 flex items-center gap-3 z-50 backdrop-blur-xl"
                style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    boxShadow: '0 0 24px rgba(56, 189, 248, 0.2), 0 8px 32px rgba(0, 0, 0, 0.4)',
                    color: '#38BDF8'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 32px rgba(56, 189, 248, 0.4), 0 8px 32px rgba(0, 0, 0, 0.6)'
                    e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.6)'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 24px rgba(56, 189, 248, 0.2), 0 8px 32px rgba(0, 0, 0, 0.4)'
                    e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)'
                }}
            >
                <FileDown className="w-5 h-5" />
                <span className="text-sm">Download Full Portfolio (PDF)</span>
            </button>

            {/* Contact Modal */}
            {showContactModal && portfolioData?.user && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-surface-1 border border-border-subtle rounded-vault-lg shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-border-subtle flex items-center justify-between bg-surface-2/30">
                            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                <Mail className="w-5 h-5 text-accent-cyan" />
                                Contact Candidate
                            </h3>
                            <button
                                onClick={() => setShowContactModal(false)}
                                className="text-text-muted hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Email Address */}
                            <div>
                                <label className="text-xs font-mono text-text-muted mb-2 block uppercase tracking-wider">To</label>
                                <div className="flex items-center gap-2 p-3 bg-surface-2 rounded-vault border border-border-subtle group hover:border-accent-cyan/50 transition-colors">
                                    <span className="flex-1 text-text-primary font-mono text-sm">{portfolioData.user.email}</span>
                                    <button
                                        onClick={() => copyToClipboard(portfolioData.user.email)}
                                        className="p-2 hover:bg-white/10 rounded-md text-text-muted hover:text-accent-cyan transition-colors"
                                        title="Copy Email"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Subject & Body Preview */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-mono text-text-muted mb-2 block uppercase tracking-wider">Subject</label>
                                    <div className="p-3 bg-surface-2 rounded-vault border border-border-subtle text-text-secondary text-sm">
                                        {getEmailContent().subject}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-mono text-text-muted mb-2 block uppercase tracking-wider">Message Preview</label>
                                    <div className="p-3 bg-surface-2 rounded-vault border border-border-subtle text-text-secondary text-sm whitespace-pre-wrap h-32 overflow-y-auto custom-scrollbar">
                                        {getEmailContent().body}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        const { email, subject, body } = getEmailContent()
                                        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank')
                                    }}
                                    className="flex items-center justify-center gap-2 p-3 rounded-vault bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all font-medium"
                                >
                                    <Mail className="w-4 h-4" />
                                    Open in Gmail
                                </button>
                                <button
                                    onClick={() => {
                                        const { email, subject, body } = getEmailContent()
                                        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                                    }}
                                    className="flex items-center justify-center gap-2 p-3 rounded-vault bg-surface-2 text-text-primary hover:bg-surface-3 border border-border-subtle transition-all font-medium"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Default Mail App
                                </button>
                                <button
                                    onClick={() => {
                                        const { body } = getEmailContent()
                                        copyToClipboard(body)
                                    }}
                                    className="col-span-full flex items-center justify-center gap-2 p-3 rounded-vault bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg hover:shadow-cyan-500/20 transition-all font-bold"
                                >
                                    <Copy className="w-4 h-4" />
                                    Copy Message to Clipboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                {portfolioData && (
                    <PortfolioPDF
                        ref={resumeRef}
                        user={portfolioData.user}
                        documents={portfolioData.documents}
                        projects={portfolioData.projects || []}
                    />
                )}
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(30px, -30px); }
                }
                @keyframes scanline {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(600px); }
                }
            `}</style>
        </div>
    )
}
