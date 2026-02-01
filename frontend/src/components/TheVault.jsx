import { useState, useEffect, useRef } from 'react'
import { FileText, Image as ImageIcon, ExternalLink, MoreVertical, Download, Share2, Trash2, Search, SearchX } from 'lucide-react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import api from '../api'

export default function TheVault() {
    const [documents, setDocuments] = useState([])
    const [userId, setUserId] = useState(null)
    const [openMenuId, setOpenMenuId] = useState(null)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [deletingId, setDeletingId] = useState(null)
    const menuRef = useRef(null)

    const categories = ['All', 'Academics', 'Internships', 'Projects', 'Certifications', 'Extracurriculars']

    useEffect(() => {
        // Get user ID from localStorage
        const userDataString = localStorage.getItem('user')
        if (userDataString) {
            try {
                const userData = JSON.parse(userDataString)
                // Check for both 'id' and '_id' (MongoDB uses _id)
                const uid = userData.id || userData._id
                if (uid) {
                    setUserId(uid)
                    fetchDocuments(uid)
                } else {
                    console.error('No userId found in localStorage')
                }
            } catch (error) {
                console.error('Error parsing user data:', error)
            }
        }
    }, [])

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchDocuments = async (uid) => {
        try {
            console.log('🔄 Fetching documents for user:', uid)
            const response = await api.get(`/api/documents/user/${uid}`)
            console.log('📥 Documents received:', response.data)
            if (response.data.success) {
                setDocuments(response.data.documents)
                console.log('✅ Documents loaded:', response.data.count)
            }
        } catch (error) {
            console.error('❌ Error fetching documents:', error)
        }
    }

    // Filter documents based on search and category
    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.originalName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase()
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp']
        return imageExts.includes(ext) ? ImageIcon : FileText
    }

    const getCategoryColor = (cat) => {
        const colors = {
            'Academics': 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30',
            'Internships': 'bg-accent-teal/10 text-accent-teal border-accent-teal/30',
            'Projects': 'bg-accent-violet/10 text-accent-violet border-accent-violet/30',
            'Certifications': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
            'Extracurriculars': 'bg-pink-500/10 text-pink-400 border-pink-500/30'
        }
        return colors[cat] || colors['Academics']
    }

    const handleViewDocument = async (doc) => {
        try {
            // Check if document has Cloudinary URL (new uploads)
            if (doc.cloudinaryPublicId) {
                console.log('🔒 Fetching signed URL for:', doc.originalName)
                const response = await api.get(`/api/documents/view/${doc._id}`)
                if (response.data.success) {
                    console.log('✅ Opening signed URL (expires in 10 min)')
                    window.open(response.data.signedUrl, '_blank')
                } else {
                    alert('Failed to generate secure link')
                }
            } else {
                // Fallback for old documents without Cloudinary
                console.log('⚠️  Legacy document - using local URL')
                if (doc.fileUrl) {
                    window.open(`http://localhost:5000${doc.fileUrl}`, '_blank')
                } else {
                    alert('⚠️  This document needs to be re-uploaded for secure cloud access')
                }
            }
        } catch (error) {
            console.error('❌ View error:', error)
            alert('Failed to open document. Please try again.')
        }
    }

    const handleDownload = async (doc) => {
        try {
            setOpenMenuId(null)
            console.log('📥 Downloading:', doc.originalName)

            if (doc.cloudinaryPublicId) {
                // Get signed download URL (with attachment flag)
                const response = await api.get(`/api/documents/download/${doc._id}`)
                if (response.data.success) {
                    // Open download URL - browser will handle the download
                    window.open(response.data.downloadUrl, '_blank')
                    console.log('✅ Download initiated')
                }
            } else {
                // Fallback for legacy documents
                alert('⚠️ This document needs to be re-uploaded for secure download')
            }
        } catch (error) {
            console.error('❌ Download error:', error)
            alert('Failed to download document')
        }
    }

    const handleShare = async (doc) => {
        setOpenMenuId(null)

        try {
            console.log('🔗 Generating share link for:', doc.originalName)

            if (doc.cloudinaryPublicId) {
                // Get signed share URL (10-minute expiry)
                const response = await api.get(`/api/documents/share/${doc._id}`)

                if (response.data.success) {
                    const shareUrl = response.data.shareUrl
                    const shareData = {
                        title: doc.originalName,
                        text: `View document: ${doc.originalName} (Link expires in 10 minutes)`,
                        url: shareUrl
                    }

                    // Try Web Share API first
                    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                        await navigator.share(shareData)
                        console.log('✅ Shared via Web Share API')
                    } else {
                        // Fallback to clipboard copy
                        await navigator.clipboard.writeText(shareUrl)
                        setShowToast(true)
                        setTimeout(() => setShowToast(false), 3000)
                        console.log('✅ Link copied to clipboard')
                    }
                }
            } else {
                alert('⚠️ This document needs to be re-uploaded for secure sharing')
            }
        } catch (error) {
            console.error('❌ Share error:', error)
            // If Web Share failed but we have the URL, try clipboard as fallback
            if (error.name === 'AbortError') {
                console.log('User cancelled share')
            } else {
                alert('Failed to share document')
            }
        }
    }

    const handleDelete = async (doc) => {
        setOpenMenuId(null)

        if (!window.confirm(`Are you sure you want to delete "${doc.originalName}"? This action cannot be undone.`)) {
            return
        }

        try {
            console.log('🗑️  Deleting document:', doc.originalName)
            setDeletingId(doc._id)

            const response = await api.delete(`/api/documents/${doc._id}`)

            if (response.data.success) {
                console.log('✅ Document deleted successfully')
                fetchDocuments(userId)
            }
        } catch (error) {
            console.error('❌ Delete error:', error)
            alert(error.response?.data?.message || 'Failed to delete document')
        } finally {
            setDeletingId(null)
        }
    }

    const handleToggleVisibility = async (doc) => {
        try {
            const newVisibility = !doc.isPublic
            console.log(`🔄 Toggling visibility for: ${doc.originalName} to ${newVisibility ? 'PUBLIC' : 'PRIVATE'}`)

            const response = await api.patch(`/api/documents/${doc._id}/visibility`, {
                isPublic: newVisibility
            })

            if (response.data.success) {
                console.log('✅ Visibility updated')

                // Update local state
                setDocuments(prevDocs =>
                    prevDocs.map(d =>
                        d._id === doc._id ? { ...d, isPublic: newVisibility } : d
                    )
                )

                // Show toast
                setToastMessage(newVisibility ? '✅ Now visible on portfolio' : '🔒 Hidden from portfolio')
                setShowToast(true)
                setTimeout(() => setShowToast(false), 3000)
            }
        } catch (error) {
            console.error('❌ Visibility toggle error:', error)
            alert('Failed to update visibility')
        }
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
                            <div className="mb-12">
                                <h3 className="text-4xl font-display font-bold tracking-tight text-text-primary mb-3">
                                    The Vault
                                </h3>
                                <p className="text-text-secondary text-lg">
                                    Your secure document collection
                                </p>
                            </div>

                            {documents.length === 0 ? (
                                // Empty State - No Documents
                                <div className="text-center py-24">
                                    <div className="max-w-md mx-auto">
                                        <p className="text-lg leading-relaxed" style={{ color: '#94A3B8' }}>
                                            Your Vault is empty. Visit the Security Deposit to add documents.
                                        </p>
                                        <a
                                            href="/deposit"
                                            className="btn-primary inline-block mt-8"
                                        >
                                            Go to Security Deposit
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Search and Filter Bar */}
                                    <div className="mb-10 space-y-6">
                                        {/* Search Input */}
                                        <div className="relative max-w-xl">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <Search className="w-5 h-5" style={{ color: '#94A3B8' }} />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Search your vault..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 rounded-vault transition-all duration-vault focus:outline-none"
                                                style={{
                                                    backgroundColor: '#020617',
                                                    border: '1px solid rgba(148, 163, 184, 0.15)',
                                                    color: '#E5E7EB',
                                                    fontFamily: 'Inter, sans-serif'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#38BDF8'
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.1)'
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = 'rgba(148, 163, 184, 0.15)'
                                                    e.target.style.boxShadow = 'none'
                                                }}
                                            />
                                        </div>

                                        {/* Category Filter Chips */}
                                        <div className="flex flex-wrap gap-3">
                                            {categories.map(category => (
                                                <button
                                                    key={category}
                                                    onClick={() => setSelectedCategory(category)}
                                                    className="px-5 py-2 transition-all duration-vault"
                                                    style={{
                                                        borderRadius: '20px',
                                                        border: selectedCategory === category
                                                            ? '1px solid #38BDF8'
                                                            : '1px solid rgba(148, 163, 184, 0.1)',
                                                        backgroundColor: selectedCategory === category
                                                            ? 'rgba(56, 189, 248, 0.1)'
                                                            : 'transparent',
                                                        color: selectedCategory === category
                                                            ? '#38BDF8'
                                                            : '#94A3B8',
                                                        fontFamily: 'Inter, sans-serif',
                                                        fontSize: '14px',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    {category}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {filteredDocuments.length === 0 ? (
                                        // Empty Search State
                                        <div className="text-center py-24">
                                            <div className="flex justify-center mb-6">
                                                <div className="w-20 h-20 rounded-full bg-surface-1 flex items-center justify-center">
                                                    <SearchX className="w-10 h-10 text-text-muted" strokeWidth={1.5} />
                                                </div>
                                            </div>
                                            <p className="text-lg" style={{ color: '#94A3B8' }}>
                                                No documents found matching your search.
                                            </p>
                                            <button
                                                onClick={() => {
                                                    setSearchTerm('')
                                                    setSelectedCategory('All')
                                                }}
                                                className="btn-secondary mt-6"
                                            >
                                                Clear Filters
                                            </button>
                                        </div>
                                    ) : (
                                        // Document Grid with Smooth Animation
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-500">
                                            {filteredDocuments.map((doc, index) => {
                                                const FileIcon = getFileIcon(doc.originalName)
                                                return (
                                                    <div
                                                        key={doc._id}
                                                        className="group relative rounded-vault-lg p-6 border transition-all duration-vault"
                                                        style={{
                                                            background: 'linear-gradient(145deg, #0F172A, #020617)',
                                                            borderColor: 'rgba(148, 163, 184, 0.08)',
                                                            animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                                                            opacity: deletingId === doc._id ? 0.5 : 1,
                                                            pointerEvents: deletingId === doc._id ? 'none' : 'auto'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (deletingId !== doc._id) {
                                                                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.35)'
                                                                e.currentTarget.style.boxShadow = '0 4px 24px rgba(56, 189, 248, 0.2)'
                                                                e.currentTarget.style.transform = 'translateY(-4px)'
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (deletingId !== doc._id) {
                                                                e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.08)'
                                                                e.currentTarget.style.boxShadow = 'none'
                                                                e.currentTarget.style.transform = 'translateY(0)'
                                                            }
                                                        }}
                                                    >
                                                        {/* Deleting Overlay */}
                                                        {deletingId === doc._id && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-bg-top/80 rounded-vault-lg z-10">
                                                                <div className="text-center">
                                                                    <div className="w-12 h-12 border-4 border-accent-teal border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                                                    <p className="text-sm text-accent-teal font-medium">Deleting from cloud...</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Header with Icon and More Menu */}
                                                        <div className="flex items-start justify-between mb-5">
                                                            <div className="w-14 h-14 rounded-vault bg-accent-cyan/10 flex items-center justify-center">
                                                                <FileIcon className="w-7 h-7 text-accent-cyan" strokeWidth={2} />
                                                            </div>

                                                            {/* More Menu */}
                                                            <div className="relative" ref={openMenuId === doc._id ? menuRef : null}>
                                                                <button
                                                                    onClick={() => setOpenMenuId(openMenuId === doc._id ? null : doc._id)}
                                                                    className="p-2 rounded-vault transition-all duration-vault"
                                                                    style={{
                                                                        color: '#94A3B8'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.color = '#38BDF8'
                                                                        e.currentTarget.style.boxShadow = '0 0 12px rgba(56, 189, 248, 0.3)'
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.color = '#94A3B8'
                                                                        e.currentTarget.style.boxShadow = 'none'
                                                                    }}
                                                                >
                                                                    <MoreVertical className="w-5 h-5" />
                                                                </button>

                                                                {/* Dropdown Menu */}
                                                                {openMenuId === doc._id && (
                                                                    <div
                                                                        className="absolute right-0 mt-2 w-44 z-10"
                                                                        style={{
                                                                            background: '#111C33',
                                                                            border: '1px solid rgba(148, 163, 184, 0.15)',
                                                                            borderRadius: '10px',
                                                                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                                                                        }}
                                                                    >
                                                                        <button
                                                                            onClick={() => handleDownload(doc)}
                                                                            className="w-full flex items-center gap-3 px-4 py-3 text-text-primary hover:bg-surface-2 transition-colors"
                                                                            style={{
                                                                                fontSize: '14px',
                                                                                fontFamily: 'Inter, sans-serif',
                                                                                borderTopLeftRadius: '10px',
                                                                                borderTopRightRadius: '10px'
                                                                            }}
                                                                        >
                                                                            <Download className="w-4 h-4" />
                                                                            Download
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleShare(doc)}
                                                                            className="w-full flex items-center gap-3 px-4 py-3 text-text-primary hover:bg-surface-2 transition-colors"
                                                                            style={{
                                                                                fontSize: '14px',
                                                                                fontFamily: 'Inter, sans-serif'
                                                                            }}
                                                                        >
                                                                            <Share2 className="w-4 h-4" />
                                                                            Share
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDelete(doc)}
                                                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition-colors"
                                                                            style={{
                                                                                fontSize: '14px',
                                                                                fontFamily: 'Inter, sans-serif',
                                                                                color: '#F87171',
                                                                                borderBottomLeftRadius: '10px',
                                                                                borderBottomRightRadius: '10px'
                                                                            }}
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Document Title */}
                                                        <h5
                                                            className="text-lg font-medium tracking-tight mb-4 line-clamp-2"
                                                            style={{
                                                                fontFamily: 'Outfit, sans-serif',
                                                                color: '#E5E7EB',
                                                                minHeight: '3.5rem'
                                                            }}
                                                            title={doc.originalName}
                                                        >
                                                            {doc.originalName}
                                                        </h5>

                                                        {/* Category Badge */}
                                                        <div className="mb-3">
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(doc.category)}`}>
                                                                {doc.category}
                                                            </span>
                                                        </div>

                                                        {/* Portfolio Visibility Toggle */}
                                                        <div className="mb-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-medium text-text-muted" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                                        Show on Portfolio
                                                                    </span>
                                                                    {doc.isPublic && (
                                                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-teal-500/10 border border-teal-500/30 text-teal-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                                            PUBLIC
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    onClick={() => handleToggleVisibility(doc)}
                                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${doc.isPublic ? 'bg-teal-500' : 'bg-slate-600'
                                                                        }`}
                                                                >
                                                                    <span
                                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${doc.isPublic ? 'translate-x-6' : 'translate-x-1'
                                                                            }`}
                                                                    />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Metadata - Size & Date */}
                                                        <div className="space-y-2 mb-6">
                                                            <div className="flex items-center justify-between text-sm font-mono">
                                                                <span className="text-text-muted">Size</span>
                                                                <span className="text-text-secondary">{formatFileSize(doc.fileSize)}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-sm font-mono">
                                                                <span className="text-text-muted">Added</span>
                                                                <span className="text-text-secondary">{formatDate(doc.uploadDate)}</span>
                                                            </div>
                                                        </div>

                                                        {/* Derived Description (if available) */}
                                                        {doc.derivedDescription && (
                                                            <div className="mb-6 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                                                                <p className="text-xs text-text-muted mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                                    Description
                                                                </p>
                                                                <p className="text-sm text-text-secondary leading-relaxed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                                    {doc.derivedDescription}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* View Document Button */}
                                                        <button
                                                            onClick={() => handleViewDocument(doc)}
                                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-vault bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/20 transition-all duration-vault"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                            <span className="text-sm font-medium">View Document</span>
                                                        </button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Toast Notification */}
                    {showToast && (
                        <div
                            className="fixed bottom-8 right-8 px-6 py-4 rounded-vault-lg shadow-vault-lg animate-vault-pulse z-50"
                            style={{
                                background: 'rgba(45, 212, 191, 0.15)',
                                border: '1px solid rgba(45, 212, 191, 0.3)',
                                color: '#2DD4BF'
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <Share2 className="w-5 h-5" />
                                <span className="font-medium">{toastMessage || 'Link Copied!'}</span>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
