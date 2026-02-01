import { useState, useEffect } from 'react'
import { UploadCloud, FileText, X, CheckCircle, ChevronDown } from 'lucide-react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function SecurityDeposit() {
    const navigate = useNavigate()
    const [isDragging, setIsDragging] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)
    const [category, setCategory] = useState('Academics')
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const [userId, setUserId] = useState(null)
    const [guideExpanded, setGuideExpanded] = useState(false)

    // PDF Extraction Review Modal State
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [extractedData, setExtractedData] = useState(null)
    const [reviewTitle, setReviewTitle] = useState('')
    const [reviewDescription, setReviewDescription] = useState('')
    const [reviewCategory, setReviewCategory] = useState('')
    const [uploadedDocId, setUploadedDocId] = useState(null)
    const [isExtracting, setIsExtracting] = useState(false)

    const categories = ['Academics', 'Internships', 'Projects', 'Certifications', 'Extracurriculars']

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
                } else {
                    console.error('No userId found in localStorage')
                }
            } catch (error) {
                console.error('Error parsing user data:', error)
            }
        }
    }, [])

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
            // Check if PDF for extraction indicator
            const isPDF = selectedFile.name.toLowerCase().endsWith('.pdf')
            if (isPDF) {
                setIsExtracting(true)
            }

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
            setIsExtracting(false)

            if (response.data.success) {
                const doc = response.data.document
                const isPDF = selectedFile.name.toLowerCase().endsWith('.pdf')

                console.log('📤 Upload response:', doc)

                // If PDF, ALWAYS show review modal so user can add/edit details
                if (isPDF) {
                    console.log('📄 PDF uploaded, showing review modal with data:', {
                        title: doc.derivedTitle,
                        description: doc.derivedDescription,
                        category: doc.suggestedCategory
                    })

                    // Show review modal with extracted data or defaults
                    setExtractedData(doc)
                    // Use derived title, or filename without extension
                    setReviewTitle(doc.derivedTitle || doc.fileName.replace(/\.[^/.]+$/, ''))
                    setReviewDescription(doc.derivedDescription || '')
                    setReviewCategory(doc.suggestedCategory || category)
                    setUploadedDocId(doc.id)
                    setShowReviewModal(true)
                    setUploading(false)
                } else {
                    // Not a PDF, go directly to vault
                    console.log('✅ Upload complete (non-PDF), redirecting to vault')
                    setUploadSuccess(true)
                    setTimeout(() => {
                        navigate('/vault')
                    }, 2000)
                }
            }
        } catch (error) {
            console.error('Upload error:', error)
            setUploading(false)
            setUploadProgress(0)
            setIsExtracting(false)
            alert(error.response?.data?.message || 'Upload failed')
        }
    }

    const handleConfirmMetadata = async () => {
        try {
            // Check if user made any changes
            const hasChanges =
                reviewTitle !== extractedData.derivedTitle ||
                reviewDescription !== extractedData.derivedDescription ||
                reviewCategory !== extractedData.category

            if (hasChanges) {
                // Update metadata with userEdited flag
                await api.patch(`/api/documents/${uploadedDocId}/metadata`, {
                    derivedTitle: reviewTitle,
                    derivedDescription: reviewDescription,
                    category: reviewCategory
                })
            }

            // Close modal and show success
            setShowReviewModal(false)
            setUploadSuccess(true)
            setTimeout(() => {
                navigate('/vault')
            }, 2000)
        } catch (error) {
            console.error('Metadata update error:', error)
            alert('Failed to update metadata')
        }
    }

    const handleGoToVault = () => {
        navigate('/vault')
    }

    const handleReset = () => {
        setSelectedFile(null)
        setUploading(false)
        setUploadProgress(0)
        setUploadSuccess(false)
        setCategory('Academics')
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
                        <div className="max-w-4xl mx-auto">
                            <div className="mb-12">
                                <h3 className="text-4xl font-display font-bold tracking-tight text-text-primary mb-3">
                                    Security Deposit
                                </h3>
                                <p className="text-text-secondary text-lg">
                                    Securely upload your documents to the vault
                                </p>
                            </div>

                            {/* Vaulting Guide - Collapsible */}
                            <div className="mb-8 rounded-vault-lg border transition-all duration-vault" style={{
                                background: '#0F172A',
                                borderColor: 'rgba(45, 212, 191, 0.3)'
                            }}>
                                <button
                                    onClick={() => setGuideExpanded(!guideExpanded)}
                                    className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors rounded-vault-lg"
                                >
                                    <h4 className="text-xl font-semibold text-text-primary" style={{
                                        fontFamily: 'Outfit, sans-serif'
                                    }}>
                                        📚 Locker Guidelines
                                    </h4>
                                    <ChevronDown
                                        className={`w-6 h-6 text-accent-teal transition-transform duration-vault ${guideExpanded ? 'rotate-180' : ''
                                            }`}
                                    />
                                </button>

                                {guideExpanded && (
                                    <div className="px-8 pb-8 space-y-6">
                                        <p className="text-text-secondary text-sm leading-relaxed">
                                            Organize your academic journey with precision. Each category is designed to help you build a comprehensive, verified portfolio.
                                        </p>

                                        <div className="space-y-5">
                                            {/* Academics */}
                                            <div className="p-5 rounded-vault bg-surface-2/30 border border-border-subtle">
                                                <h5 className="text-base font-semibold text-accent-cyan mb-2" style={{
                                                    fontFamily: 'Outfit, sans-serif'
                                                }}>
                                                    📖 Academics
                                                </h5>
                                                <p className="text-sm text-text-secondary mb-3 leading-relaxed">
                                                    Semester mark sheets, transcripts, and official university grade cards. These form the foundation of your academic record.
                                                </p>
                                                <p className="text-xs text-text-muted" style={{
                                                    fontFamily: 'JetBrains Mono, monospace'
                                                }}>
                                                    Accepted: PDF, JPG, PNG
                                                </p>
                                            </div>

                                            {/* Internships */}
                                            <div className="p-5 rounded-vault bg-surface-2/30 border border-border-subtle">
                                                <h5 className="text-base font-semibold text-accent-teal mb-2" style={{
                                                    fontFamily: 'Outfit, sans-serif'
                                                }}>
                                                    💼 Internships
                                                </h5>
                                                <p className="text-sm text-text-secondary mb-3 leading-relaxed">
                                                    Offer letters, completion certificates, and feedback reports. Document your professional experience and industry exposure.
                                                </p>
                                                <p className="text-xs text-text-muted" style={{
                                                    fontFamily: 'JetBrains Mono, monospace'
                                                }}>
                                                    Accepted: PDF, JPG, PNG
                                                </p>
                                            </div>

                                            {/* Projects */}
                                            <div className="p-5 rounded-vault bg-surface-2/30 border border-border-subtle">
                                                <h5 className="text-base font-semibold text-accent-violet mb-2" style={{
                                                    fontFamily: 'Outfit, sans-serif'
                                                }}>
                                                    💻 Projects
                                                </h5>
                                                <p className="text-sm text-text-secondary mb-3 leading-relaxed">
                                                    Source code snapshots, project reports, and AI model presentation slides. Showcase your technical capabilities and innovation.
                                                </p>
                                                <p className="text-xs text-text-muted" style={{
                                                    fontFamily: 'JetBrains Mono, monospace'
                                                }}>
                                                    Accepted: PDF, JPG, PNG, ZIP
                                                </p>
                                            </div>

                                            {/* Certifications */}
                                            <div className="p-5 rounded-vault bg-surface-2/30 border border-border-subtle">
                                                <h5 className="text-base font-semibold text-yellow-400 mb-2" style={{
                                                    fontFamily: 'Outfit, sans-serif'
                                                }}>
                                                    🏆 Certifications
                                                </h5>
                                                <p className="text-sm text-text-secondary mb-3 leading-relaxed">
                                                    Professional course certificates (e.g., Coursera, Udemy) and hackathon wins. Validate your continuous learning and achievements.
                                                </p>
                                                <p className="text-xs text-text-muted" style={{
                                                    fontFamily: 'JetBrains Mono, monospace'
                                                }}>
                                                    Accepted: PDF, JPG, PNG
                                                </p>
                                            </div>

                                            {/* Extracurriculars */}
                                            <div className="p-5 rounded-vault bg-surface-2/30 border border-border-subtle">
                                                <h5 className="text-base font-semibold text-green-400 mb-2" style={{
                                                    fontFamily: 'Outfit, sans-serif'
                                                }}>
                                                    🌟 Extracurriculars
                                                </h5>
                                                <p className="text-sm text-text-secondary mb-3 leading-relaxed">
                                                    Volunteer proofs, club membership letters, and sports achievements. Demonstrate your well-rounded personality and leadership.
                                                </p>
                                                <p className="text-xs text-text-muted" style={{
                                                    fontFamily: 'JetBrains Mono, monospace'
                                                }}>
                                                    Accepted: PDF, JPG, PNG
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-border-subtle">
                                            <p className="text-xs text-text-muted text-center" style={{
                                                fontFamily: 'Inter, sans-serif'
                                            }}>
                                                💡 Tip: Organize your documents thoughtfully. A well-structured vault creates a powerful portfolio.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Upload Area */}
                            <div className="glass-panel p-10">
                                {/* Category Selector - Vault Styled */}
                                <div className="mb-8">
                                    <label className="block text-sm font-medium text-text-secondary mb-3">
                                        Document Category
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        disabled={uploading || uploadSuccess}
                                        className="w-full px-4 py-3 rounded-vault font-medium text-text-primary transition-all duration-vault focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-top"
                                        style={{
                                            backgroundColor: '#020617',
                                            border: '1px solid rgba(148, 163, 184, 0.15)',
                                            focusBorderColor: '#38BDF8'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#38BDF8'
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = 'rgba(148, 163, 184, 0.15)'
                                        }}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Large Deposit Zone */}
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`relative border-2 border-dashed rounded-vault-lg p-16 text-center transition-all duration-vault ${isDragging
                                        ? 'border-accent-teal bg-accent-teal/5 shadow-vault-glow'
                                        : 'border-border-default bg-bg-bottom'
                                        }`}
                                    style={{
                                        borderColor: isDragging ? '#2DD4BF' : 'rgba(148, 163, 184, 0.15)',
                                        minHeight: '400px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {!selectedFile && !uploading && !uploadSuccess && (
                                        <div className="w-full">
                                            <div className="flex justify-center mb-6">
                                                <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-vault ${isDragging ? 'bg-accent-teal/20 glow-teal' : 'bg-accent-cyan/10'
                                                    }`}>
                                                    <UploadCloud className={`w-10 h-10 ${isDragging ? 'text-accent-teal' : 'text-accent-cyan'
                                                        }`} strokeWidth={2} />
                                                </div>
                                            </div>
                                            <h5 className="text-2xl font-display font-semibold tracking-tight text-text-primary mb-3">
                                                Drag & Drop your document here
                                            </h5>
                                            <p className="text-text-secondary mb-6">
                                                or click to browse files
                                            </p>
                                            <input
                                                type="file"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                                id="file-upload"
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.zip"
                                            />
                                            <label htmlFor="file-upload" className="btn-primary cursor-pointer inline-block text-base px-8 py-3">
                                                Browse Files
                                            </label>
                                            <p className="text-xs text-text-muted mt-6">
                                                Supported: PDF, DOC, DOCX, JPG, PNG, TXT, ZIP (Max 10MB)
                                            </p>
                                        </div>
                                    )}

                                    {selectedFile && !uploading && !uploadSuccess && (
                                        <div className="w-full space-y-6">
                                            <div className="flex items-center justify-center gap-4 p-6 bg-surface-1 rounded-vault max-w-lg mx-auto">
                                                <FileText className="w-8 h-8 text-accent-cyan flex-shrink-0" />
                                                <div className="flex-1 text-left">
                                                    <p className="text-base font-medium text-text-primary mb-1">{selectedFile.name}</p>
                                                    <p className="text-sm font-mono text-text-secondary">{formatFileSize(selectedFile.size)}</p>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedFile(null)}
                                                    className="text-text-secondary hover:text-text-primary transition-colors"
                                                >
                                                    <X className="w-6 h-6" />
                                                </button>
                                            </div>

                                            {/* Deposit to Vault Button - Cyan to Teal Gradient */}
                                            <button
                                                onClick={handleUpload}
                                                className="px-8 py-3.5 text-base font-semibold text-white transition-all duration-vault hover:shadow-vault-glow"
                                                style={{
                                                    background: 'linear-gradient(135deg, #38BDF8 0%, #2DD4BF 100%)',
                                                    borderRadius: '12px'
                                                }}
                                            >
                                                Deposit to Vault
                                            </button>
                                        </div>
                                    )}

                                    {uploading && !uploadSuccess && (
                                        <div className="w-full space-y-6">
                                            <div className="flex justify-center mb-6">
                                                <div className="w-20 h-20 rounded-full bg-accent-cyan/20 flex items-center justify-center animate-vault-pulse">
                                                    <UploadCloud className="w-10 h-10 text-accent-cyan" />
                                                </div>
                                            </div>
                                            <h5 className="text-2xl font-display font-semibold tracking-tight text-text-primary">
                                                {isExtracting ? '📄 Extracting PDF Content...' : 'Encrypting and Vaulting to Cloud...'}
                                            </h5>
                                            {isExtracting && (
                                                <p className="text-sm text-text-muted" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                    Reading document to extract title & description
                                                </p>
                                            )}
                                            <div className="max-w-md mx-auto">
                                                <div className="h-2 bg-surface-1 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full transition-all duration-300"
                                                        style={{
                                                            width: isExtracting ? '100%' : `${uploadProgress}%`,
                                                            background: isExtracting
                                                                ? 'linear-gradient(135deg, #A855F7 0%, #8B5CF6 100%)'
                                                                : 'linear-gradient(135deg, #38BDF8 0%, #2DD4BF 100%)'
                                                        }}
                                                    />
                                                </div>
                                                <p className="text-sm font-mono text-text-secondary mt-3">
                                                    {isExtracting ? 'Extracting...' : `${uploadProgress}%`}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {uploadSuccess && (
                                        <div className="w-full space-y-6 animate-vault-pulse">
                                            <div className="flex justify-center mb-6">
                                                <div className="w-20 h-20 rounded-full bg-accent-teal/20 flex items-center justify-center glow-teal">
                                                    <CheckCircle className="w-10 h-10 text-accent-teal" />
                                                </div>
                                            </div>
                                            <h5 className="text-2xl font-display font-semibold tracking-tight text-accent-teal">
                                                Document Secured Successfully!
                                            </h5>
                                            <p className="text-text-secondary">
                                                Your document has been safely deposited to the vault.
                                            </p>

                                            {/* Navigation Buttons */}
                                            <div className="flex items-center justify-center gap-4 mt-8">
                                                <button
                                                    onClick={handleGoToVault}
                                                    className="px-8 py-3.5 text-base font-semibold text-white transition-all duration-vault hover:shadow-vault-glow"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #38BDF8 0%, #2DD4BF 100%)',
                                                        borderRadius: '12px'
                                                    }}
                                                >
                                                    Go to The Vault
                                                </button>
                                                <button
                                                    onClick={handleReset}
                                                    className="btn-secondary px-8 py-3.5 text-base"
                                                >
                                                    Upload Another
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* PDF Extraction Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
                    <div
                        className="w-full max-w-2xl rounded-vault-lg border border-cyan-500/30 p-8 shadow-vault-lg"
                        style={{
                            background: 'rgba(15, 23, 42, 0.95)',
                            backdropFilter: 'blur(20px)'
                        }}
                    >
                        {/* Header */}
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-text-primary mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                📄 Review Document Details
                            </h3>
                            <p className="text-sm text-text-muted" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                We've extracted the following from your PDF. Edit if needed before vaulting.
                            </p>
                        </div>

                        {/* Title Field */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-text-secondary mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                Title
                            </label>
                            <input
                                type="text"
                                value={reviewTitle}
                                onChange={(e) => setReviewTitle(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-text-primary focus:border-cyan-500 focus:outline-none transition-colors"
                                style={{ fontFamily: 'JetBrains Mono, monospace' }}
                                placeholder="Enter document title..."
                            />
                        </div>

                        {/* Category Dropdown */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-text-secondary mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                Category
                            </label>
                            <select
                                value={reviewCategory}
                                onChange={(e) => setReviewCategory(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-text-primary focus:border-cyan-500 focus:outline-none transition-colors"
                                style={{ fontFamily: 'JetBrains Mono, monospace' }}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Description Field */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-text-secondary mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                Description
                            </label>
                            <textarea
                                value={reviewDescription}
                                onChange={(e) => setReviewDescription(e.target.value)}
                                rows={5}
                                className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-text-primary focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', lineHeight: '1.5' }}
                                placeholder="Enter document description..."
                            />
                            <p className="text-xs text-text-muted mt-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                {reviewDescription.length} / 300 characters
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-4">
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="px-6 py-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-text-secondary hover:bg-slate-700 transition-colors"
                                style={{ fontFamily: 'JetBrains Mono, monospace' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmMetadata}
                                className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-vault hover:shadow-vault-glow"
                                style={{
                                    background: 'linear-gradient(135deg, #38BDF8 0%, #2DD4BF 100%)',
                                    fontFamily: 'JetBrains Mono, monospace'
                                }}
                            >
                                ✓ Confirm & Vault
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
