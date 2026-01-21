import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import { ShieldCheck, FileText, Image as ImageIcon, ExternalLink, Download, GraduationCap, Briefcase, Code, Award, FileDown } from 'lucide-react'
import api from '../api'
import PortfolioPDF from './PortfolioPDF'

export default function Portfolio() {
    const { username } = useParams()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [portfolioData, setPortfolioData] = useState(null)
    const resumeRef = useRef()

    useEffect(() => {
        fetchPortfolio()
    }, [username])

    const fetchPortfolio = async () => {
        try {
            const response = await api.get(`/api/portfolio/${username}`)
            if (response.data.success) {
                setPortfolioData(response.data)
            }
        } catch (error) {
            console.error('Portfolio fetch error:', error)
            setError(error.response?.data?.message || 'Failed to load portfolio')
        } finally {
            setLoading(false)
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

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const handleViewDocument = async (doc) => {
        try {
            console.log('🔒 Requesting guest pass for:', doc.originalName)

            if (doc.hasCloudStorage) {
                // Get signed guest pass URL (10-minute expiry)
                const response = await api.get(`/api/portfolio/${username}/document/${doc._id}`)

                if (response.data.success) {
                    console.log('✅ Guest pass generated (expires in 10 min)')
                    window.open(response.data.guestPassUrl, '_blank')
                } else {
                    alert('Failed to generate secure document link')
                }
            } else {
                alert('⚠️ This document needs to be re-uploaded for secure viewing')
            }
        } catch (error) {
            console.error('❌ View error:', error)
            alert('Failed to open document. Please try again.')
        }
    }

    const handleDownloadDocument = async (doc) => {
        try {
            console.log('📥 Requesting download guest pass for:', doc.originalName)

            if (doc.hasCloudStorage) {
                // Get signed guest pass URL with attachment mode
                const response = await api.get(`/api/portfolio/${username}/document/${doc._id}`)

                if (response.data.success) {
                    // Create a temporary link with download attribute
                    const link = document.createElement('a')
                    link.href = response.data.guestPassUrl
                    link.download = doc.originalName
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    console.log('✅ Download initiated')
                } else {
                    alert('Failed to generate download link')
                }
            } else {
                alert('⚠️ This document needs to be re-uploaded for secure download')
            }
        } catch (error) {
            console.error('❌ Download error:', error)
            alert('Failed to download document. Please try again.')
        }
    }

    const handleShareDocument = async (doc) => {
        try {
            console.log('🔗 Generating share link for:', doc.originalName)

            if (doc.hasCloudStorage) {
                // Get signed guest pass URL
                const response = await api.get(`/api/portfolio/${username}/document/${doc._id}`)

                if (response.data.success) {
                    const shareUrl = response.data.guestPassUrl
                    const shareData = {
                        title: doc.originalName,
                        text: `View document: ${doc.originalName} from ${portfolioData?.user?.name}'s portfolio (Link expires in 10 minutes)`,
                        url: shareUrl
                    }

                    // Try Web Share API first
                    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                        await navigator.share(shareData)
                        console.log('✅ Shared via Web Share API')
                    } else {
                        // Fallback to clipboard copy
                        await navigator.clipboard.writeText(shareUrl)
                        alert('✅ Link copied to clipboard! (Expires in 10 minutes)')
                        console.log('✅ Link copied to clipboard')
                    }
                } else {
                    alert('Failed to generate share link')
                }
            } else {
                alert('⚠️ This document needs to be re-uploaded for secure sharing')
            }
        } catch (error) {
            console.error('❌ Share error:', error)
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

    // Filter documents by category
    const academics = documents.filter(doc => doc.category === 'Academics')
    const internships = documents.filter(doc => doc.category === 'Internships')
    const projects = documents.filter(doc => doc.category === 'Projects')
    const certifications = documents.filter(doc => doc.category === 'Certifications')

    // Combine for timeline
    const timelineItems = [...internships, ...academics].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))

    return (
        <div className="min-h-screen page-transition relative overflow-hidden" style={{
            background: 'linear-gradient(180deg, #0A0F1F 0%, #0B1220 25%, #0D1525 50%, #0B1220 75%, #020617 100%)',
            backgroundAttachment: 'fixed'
        }}>
            {/* Animated Glow Orbs Background */}
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
                {/* Glassmorphic Hero Header */}
                <div className="mb-24">
                    <div className="max-w-4xl mx-auto p-12 rounded-vault-lg border backdrop-blur-xl" style={{
                        background: 'rgba(15, 23, 42, 0.65)',
                        borderColor: 'rgba(56, 189, 248, 0.3)',
                        boxShadow: '0 0 40px rgba(56, 189, 248, 0.15), inset 0 0 60px rgba(56, 189, 248, 0.05)'
                    }}>
                        <div className="text-center">
                            {/* Student Name with ShieldCheck */}
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
                            <p className="text-lg text-text-muted mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {user.university} • Class of {user.graduationYear}
                            </p>

                            {/* Stats */}
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
                        {/* Timeline Experience (Internships + Education) */}
                        {timelineItems.length > 0 && (
                            <div className="mb-32">
                                <h2 className="text-4xl font-semibold tracking-tight text-text-primary mb-16 text-center" style={{
                                    fontFamily: 'Outfit, sans-serif'
                                }}>
                                    Experience Timeline
                                </h2>

                                <div className="max-w-4xl mx-auto relative">
                                    {/* Glowing Timeline Line */}
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
                                                    {/* Timeline Node */}
                                                    <div className="absolute left-1/2 -ml-3 w-6 h-6 rounded-full bg-accent-teal" style={{
                                                        boxShadow: '0 0 20px rgba(45, 212, 191, 0.8), 0 0 40px rgba(45, 212, 191, 0.4)'
                                                    }} />

                                                    {/* Mini Card */}
                                                    <div className={`w-5/12 p-6 rounded-vault-lg border transition-all duration-vault hover:-translate-y-2 hover:shadow-vault-lg cursor-pointer ${isLeft ? 'text-right' : 'text-left'}`}
                                                        style={{
                                                            background: 'linear-gradient(145deg, #0F172A, #020617)',
                                                            borderColor: 'rgba(148, 163, 184, 0.08)'
                                                        }}
                                                        onClick={() => handleViewDocument(doc)}
                                                    >
                                                        <div className={`flex items-start gap-4 ${isLeft ? 'flex-row-reverse' : 'flex-row'}`}>
                                                            <div className={`w-12 h-12 rounded-vault flex items-center justify-center flex-shrink-0 ${doc.category === 'Internships' ? 'bg-accent-teal/10' : 'bg-accent-cyan/10'
                                                                }`}>
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
                                                                    {doc.originalName}
                                                                </h3>
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

                        {/* Project Showcase (Masonry Grid) */}
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
                                                    height: index % 3 === 0 ? '320px' : '280px' // Masonry effect
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

                                                    <div className="mt-auto space-y-2">
                                                        {/* Live Preview Button */}
                                                        <button
                                                            onClick={() => handleViewDocument(doc)}
                                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-vault bg-violet-600/10 border border-violet-500/30 text-violet-400 hover:bg-violet-600/20 transition-all duration-vault"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                            <span className="text-sm font-medium">Live Preview</span>
                                                        </button>

                                                        {/* Download & Share Buttons */}
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

                        {/* Certifications Gallery (Vault Cards) */}
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

                                                <h3 className="text-lg font-medium text-text-primary mb-4 line-clamp-2" style={{
                                                    fontFamily: 'Outfit, sans-serif',
                                                    minHeight: '3.5rem'
                                                }}>
                                                    {doc.originalName}
                                                </h3>

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
                    </>
                )}

                {/* Footer */}
                <div className="text-center pt-16 border-t border-border-subtle">
                    <p className="text-sm text-text-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Powered by EduVault • Secure Document Management
                    </p>
                </div>
            </div>

            {/* Floating Action Button (FAB) */}
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

            {/* Hidden Portfolio PDF Component for Printing */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                {portfolioData && (
                    <PortfolioPDF
                        ref={resumeRef}
                        user={portfolioData.user}
                        documents={portfolioData.documents}
                    />
                )}
            </div>

            {/* CSS for floating animation */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(30px, -30px); }
                }
            `}</style>
        </div>
    )
}
