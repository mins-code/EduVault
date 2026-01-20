import { useState, useEffect, useRef } from 'react'
import { UploadCloud, FileText, X, CheckCircle, Image as ImageIcon, MoreVertical, Download, Share2, Trash2, FolderOpen } from 'lucide-react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import api from '../api'

export default function MyLocker() {
    const [isDragging, setIsDragging] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)
    const [category, setCategory] = useState('Academics')
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const [documents, setDocuments] = useState([])
    const [userId, setUserId] = useState(null)
    const [openMenuId, setOpenMenuId] = useState(null)
    const menuRef = useRef(null)

    const categories = ['Academics', 'Internships', 'Projects', 'Certifications', 'Extracurriculars']

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
            const response = await api.get(`/api/documents?userId=${uid}`)
            if (response.data.success) {
                setDocuments(response.data.documents)
            }
        } catch (error) {
            console.error('Error fetching documents:', error)
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if (file) {
            setSelectedFile(file)
        }
    }

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedFile(file)
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const handleUpload = async () => {
        if (!selectedFile || !userId) return

        setUploading(true)
        setUploadProgress(0)

        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('category', category)
        formData.append('userId', userId)
        formData.append('tags', JSON.stringify([]))

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval)
                        return 90
                    }
                    return prev + 10
                })
            }, 200)

            const response = await api.post('/api/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            clearInterval(progressInterval)
            setUploadProgress(100)

            if (response.data.success) {
                setUploadSuccess(true)

                // Reset after animation
                setTimeout(() => {
                    setSelectedFile(null)
                    setUploading(false)
                    setUploadProgress(0)
                    setUploadSuccess(false)
                    fetchDocuments(userId)
                }, 2000)
            }
        } catch (error) {
            console.error('Upload error:', error)
            setUploading(false)
            setUploadProgress(0)
            alert(error.response?.data?.message || 'Upload failed')
        }
    }

    const handleDelete = async (docId) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return

        try {
            const response = await api.delete(`/api/documents/${docId}`)
            if (response.data.success) {
                fetchDocuments(userId)
            }
        } catch (error) {
            console.error('Delete error:', error)
            alert('Failed to delete document')
        }
    }

    const handleDownload = (doc) => {
        // Create download link
        const link = document.createElement('a')
        link.href = `http://localhost:5000${doc.fileUrl}`
        link.download = doc.originalName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setOpenMenuId(null)
    }

    const handleShare = (doc) => {
        // Copy file URL to clipboard
        navigator.clipboard.writeText(`http://localhost:5000${doc.fileUrl}`)
        alert('Link copied to clipboard!')
        setOpenMenuId(null)
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

    return (
        <div className="min-h-screen flex">
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
                    <div className="p-8">
                        <div className="max-w-7xl mx-auto">
                            <h3 className="text-3xl font-display font-bold tracking-tight text-text-primary mb-6">
                                My Locker
                            </h3>

                            {/* Upload Area */}
                            <div className="glass-panel p-8 mb-8">
                                <h4 className="text-xl font-display font-semibold tracking-tight text-text-primary mb-6">
                                    Upload Document
                                </h4>

                                {/* Category Selector */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-text-secondary mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="vault-input w-full max-w-md"
                                        disabled={uploading}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Dropzone */}
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`relative border-2 border-dashed rounded-vault-lg p-12 text-center transition-all duration-vault ${isDragging
                                        ? 'border-accent-teal bg-accent-teal/5 shadow-vault-glow'
                                        : 'border-border-default bg-bg-bottom'
                                        }`}
                                    style={{
                                        borderColor: isDragging ? '#2DD4BF' : 'rgba(148, 163, 184, 0.15)'
                                    }}
                                >
                                    {!selectedFile && !uploading && (
                                        <>
                                            <div className="flex justify-center mb-4">
                                                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-vault ${isDragging ? 'bg-accent-teal/20 glow-teal' : 'bg-accent-cyan/10'
                                                    }`}>
                                                    <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-accent-teal' : 'text-accent-cyan'
                                                        }`} />
                                                </div>
                                            </div>
                                            <h5 className="text-lg font-display font-semibold tracking-tight text-text-primary mb-2">
                                                Drag & Drop your document here
                                            </h5>
                                            <p className="text-sm text-text-secondary mb-4">
                                                or click to browse files
                                            </p>
                                            <input
                                                type="file"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                                id="file-upload"
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.zip"
                                            />
                                            <label htmlFor="file-upload" className="btn-primary cursor-pointer inline-block">
                                                Browse Files
                                            </label>
                                            <p className="text-xs text-text-muted mt-4">
                                                Supported: PDF, DOC, DOCX, JPG, PNG, TXT, ZIP (Max 10MB)
                                            </p>
                                        </>
                                    )}

                                    {selectedFile && !uploading && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-center gap-3 p-4 bg-surface-1 rounded-vault">
                                                <FileText className="w-6 h-6 text-accent-cyan" />
                                                <div className="flex-1 text-left">
                                                    <p className="text-sm font-medium text-text-primary">{selectedFile.name}</p>
                                                    <p className="text-xs font-mono text-text-secondary">{formatFileSize(selectedFile.size)}</p>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedFile(null)}
                                                    className="text-text-secondary hover:text-text-primary transition-colors"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <button onClick={handleUpload} className="btn-primary">
                                                Upload to Vault
                                            </button>
                                        </div>
                                    )}

                                    {uploading && (
                                        <div className="space-y-4">
                                            {!uploadSuccess ? (
                                                <>
                                                    <div className="flex justify-center mb-4">
                                                        <div className="w-16 h-16 rounded-full bg-accent-cyan/20 flex items-center justify-center animate-vault-pulse">
                                                            <UploadCloud className="w-8 h-8 text-accent-cyan" />
                                                        </div>
                                                    </div>
                                                    <h5 className="text-lg font-display font-semibold tracking-tight text-text-primary">
                                                        Vaulting Document...
                                                    </h5>
                                                    <div className="max-w-md mx-auto">
                                                        <div className="h-2 bg-surface-1 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-primary transition-all duration-300"
                                                                style={{ width: `${uploadProgress}%` }}
                                                            />
                                                        </div>
                                                        <p className="text-sm font-mono text-text-secondary mt-2">{uploadProgress}%</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="animate-vault-pulse">
                                                    <div className="flex justify-center mb-4">
                                                        <div className="w-16 h-16 rounded-full bg-accent-teal/20 flex items-center justify-center glow-teal">
                                                            <CheckCircle className="w-8 h-8 text-accent-teal" />
                                                        </div>
                                                    </div>
                                                    <h5 className="text-lg font-display font-semibold tracking-tight text-accent-teal">
                                                        Document Secured!
                                                    </h5>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Documents Gallery Grid */}
                            <div>
                                <h4 className="text-xl font-display font-semibold tracking-tight text-text-primary mb-6">
                                    Your Vault <span className="font-mono text-text-secondary">({documents.length})</span>
                                </h4>

                                {documents.length === 0 ? (
                                    // Empty State
                                    <div className="text-center py-16">
                                        <div className="flex justify-center mb-6">
                                            <div className="w-24 h-24 rounded-full bg-surface-1 flex items-center justify-center">
                                                <FolderOpen className="w-12 h-12 text-text-muted" strokeWidth={1.5} />
                                            </div>
                                        </div>
                                        <h5 className="text-lg font-display font-semibold tracking-tight text-text-primary mb-2">
                                            Vault Empty
                                        </h5>
                                        <p className="text-text-muted max-w-md mx-auto">
                                            Your secure vault is ready. Upload your first document to get started.
                                        </p>
                                    </div>
                                ) : (
                                    // Document Grid
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {documents.map((doc, index) => {
                                            const FileIcon = getFileIcon(doc.originalName)
                                            return (
                                                <div
                                                    key={doc._id}
                                                    className="group relative rounded-vault-lg p-5 border transition-all duration-vault hover-lift"
                                                    style={{
                                                        background: 'linear-gradient(145deg, #0F172A, #020617)',
                                                        borderColor: 'rgba(148, 163, 184, 0.08)',
                                                        animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.35)'
                                                        e.currentTarget.style.boxShadow = '0 0 24px rgba(56, 189, 248, 0.2)'
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.08)'
                                                        e.currentTarget.style.boxShadow = 'none'
                                                    }}
                                                >
                                                    {/* Header with Icon and More Menu */}
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="w-12 h-12 rounded-vault bg-accent-cyan/10 flex items-center justify-center">
                                                            <FileIcon className="w-6 h-6 text-accent-cyan" strokeWidth={2} />
                                                        </div>

                                                        {/* More Menu */}
                                                        <div className="relative" ref={openMenuId === doc._id ? menuRef : null}>
                                                            <button
                                                                onClick={() => setOpenMenuId(openMenuId === doc._id ? null : doc._id)}
                                                                className="p-1 rounded-vault-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors"
                                                            >
                                                                <MoreVertical className="w-4 h-4" />
                                                            </button>

                                                            {/* Dropdown Menu */}
                                                            {openMenuId === doc._id && (
                                                                <div
                                                                    className="absolute right-0 mt-2 w-40 rounded-vault-sm border border-border-subtle shadow-vault-lg z-10"
                                                                    style={{ background: 'linear-gradient(145deg, #0F172A, #020617)' }}
                                                                >
                                                                    <button
                                                                        onClick={() => handleDownload(doc)}
                                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-surface-2 transition-colors rounded-t-vault-sm"
                                                                    >
                                                                        <Download className="w-4 h-4" />
                                                                        Download
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleShare(doc)}
                                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-surface-2 transition-colors"
                                                                    >
                                                                        <Share2 className="w-4 h-4" />
                                                                        Share
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setOpenMenuId(null)
                                                                            handleDelete(doc._id)
                                                                        }}
                                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors rounded-b-vault-sm"
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
                                                        className="text-base font-medium tracking-tight mb-3 truncate"
                                                        style={{
                                                            fontFamily: 'Outfit, sans-serif',
                                                            color: '#E5E7EB'
                                                        }}
                                                        title={doc.originalName}
                                                    >
                                                        {doc.originalName}
                                                    </h5>

                                                    {/* Category Badge */}
                                                    <div className="mb-3">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getCategoryColor(doc.category)}`}>
                                                            {doc.category}
                                                        </span>
                                                    </div>

                                                    {/* File Size */}
                                                    <p className="text-xs font-mono text-text-muted">
                                                        {formatFileSize(doc.fileSize)}
                                                    </p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
