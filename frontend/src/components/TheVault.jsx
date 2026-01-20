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
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const menuRef = useRef(null)

    const categories = ['All', 'Academics', 'Internships', 'Projects', 'Certifications', 'Extracurriculars']

    useEffect(() => {
        // Get user ID from localStorage
        const userDataString = localStorage.getItem('user')
        if (userDataString) {
            try {
                const userData = JSON.parse(userDataString)
                setUserId(userData.id)
                fetchDocuments(userData.id)
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

    const handleViewDocument = (doc) => {
        window.open(`http://localhost:5000${doc.fileUrl}`, '_blank')
    }

    const handleDownload = (doc) => {
        const link = document.createElement('a')
        link.href = `http://localhost:5000${doc.fileUrl}`
        link.download = doc.originalName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setOpenMenuId(null)
    }

    const handleShare = (doc) => {
        const fileUrl = `http://localhost:5000${doc.fileUrl}`
        navigator.clipboard.writeText(fileUrl)
        setOpenMenuId(null)

        // Show toast
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
    }

    const handleDelete = async (doc) => {
        setOpenMenuId(null)

        if (!window.confirm(`Are you sure you want to delete "${doc.originalName}"? This action cannot be undone.`)) {
            return
        }

        try {
            const response = await api.delete(`/api/documents/${doc._id}`)
            if (response.data.success) {
                fetchDocuments(userId)
            }
        } catch (error) {
            console.error('Delete error:', error)
            alert('Failed to delete document')
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
                                                            animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.35)'
                                                            e.currentTarget.style.boxShadow = '0 4px 24px rgba(56, 189, 248, 0.2)'
                                                            e.currentTarget.style.transform = 'translateY(-4px)'
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.08)'
                                                            e.currentTarget.style.boxShadow = 'none'
                                                            e.currentTarget.style.transform = 'translateY(0)'
                                                        }}
                                                    >
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
                                                        <div className="mb-5">
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(doc.category)}`}>
                                                                {doc.category}
                                                            </span>
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
                                <span className="font-medium">Link Copied!</span>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
