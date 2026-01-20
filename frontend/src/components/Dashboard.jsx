import { useState, useEffect, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { FileDown } from 'lucide-react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import ResumePDF from './ResumePDF'
import api from '../api'

export default function Dashboard() {
    const [userData, setUserData] = useState(null)
    const [documents, setDocuments] = useState([])
    const [userId, setUserId] = useState(null)
    const resumeRef = useRef()

    useEffect(() => {
        // Get user data from localStorage
        const userDataString = localStorage.getItem('user')
        if (userDataString) {
            try {
                const userData = JSON.parse(userDataString)
                setUserId(userData.id)
                setUserData(userData)
                fetchDocuments(userData.id)
            } catch (error) {
                console.error('Error parsing user data:', error)
            }
        }
    }, [])

    const fetchDocuments = async (uid) => {
        try {
            console.log('🔄 Fetching documents for Dashboard:', uid)
            const response = await api.get(`/api/documents/user/${uid}`)
            console.log('📥 Dashboard documents received:', response.data.count)
            if (response.data.success) {
                setDocuments(response.data.documents)
            }
        } catch (error) {
            console.error('❌ Dashboard fetch error:', error)
        }
    }

    const handlePrintResume = useReactToPrint({
        contentRef: resumeRef,
        documentTitle: `${userData?.username || 'Resume'}_Resume`,
        onAfterPrint: () => console.log('Resume downloaded successfully')
    })

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const totalSize = documents.reduce((acc, doc) => acc + (doc.fileSize || 0), 0)

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 ml-64">
                {/* Top Bar */}
                <TopBar />

                {/* Main Content with Gradient Background */}
                <main
                    className="pt-20 min-h-screen"
                    style={{
                        background: 'linear-gradient(180deg, #0A0F1F 0%, #0B1220 50%, #020617 100%)',
                        backgroundAttachment: 'fixed'
                    }}
                >
                    <div className="p-8">
                        {/* Dashboard Content Goes Here */}
                        <div className="max-w-7xl mx-auto">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-3xl font-display font-bold tracking-tight text-text-primary">
                                    Dashboard Overview
                                </h3>

                                {/* Download Resume Button */}
                                {userData && documents.length > 0 && (
                                    <button
                                        onClick={handlePrintResume}
                                        className="px-6 py-3 rounded-vault font-semibold transition-all duration-vault hover:scale-105 flex items-center gap-3 backdrop-blur-xl"
                                        style={{
                                            background: 'rgba(15, 23, 42, 0.8)',
                                            border: '1px solid rgba(56, 189, 248, 0.4)',
                                            boxShadow: '0 0 24px rgba(56, 189, 248, 0.2)',
                                            color: '#38BDF8',
                                            fontFamily: 'Inter, sans-serif'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.boxShadow = '0 0 32px rgba(56, 189, 248, 0.4)'
                                            e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.6)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.boxShadow = '0 0 24px rgba(56, 189, 248, 0.2)'
                                            e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)'
                                        }}
                                    >
                                        <FileDown className="w-5 h-5" />
                                        <span className="text-sm">Download Resume (PDF)</span>
                                    </button>
                                )}
                            </div>

                            {/* Placeholder Content */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Stats Card 1 */}
                                <div className="vault-card p-6">
                                    <h4 className="text-lg font-display font-semibold tracking-tight text-text-primary mb-2">
                                        Total Documents
                                    </h4>
                                    <p className="text-4xl font-mono font-bold text-gradient-primary">{documents.length}</p>
                                    <p className="text-sm text-text-secondary mt-2">
                                        {documents.length === 0 ? 'No documents uploaded yet' : 'Documents in your vault'}
                                    </p>
                                </div>

                                {/* Stats Card 2 */}
                                <div className="vault-card p-6">
                                    <h4 className="text-lg font-display font-semibold tracking-tight text-text-primary mb-2">
                                        Storage Used
                                    </h4>
                                    <p className="text-4xl font-mono font-bold text-gradient-primary">{formatFileSize(totalSize)}</p>
                                    <p className="text-sm text-text-secondary mt-2">
                                        Out of unlimited storage
                                    </p>
                                </div>

                                {/* Stats Card 3 */}
                                <div className="vault-card p-6">
                                    <h4 className="text-lg font-display font-semibold tracking-tight text-text-primary mb-2">
                                        Categories
                                    </h4>
                                    <p className="text-4xl font-mono font-bold text-gradient-primary">
                                        {new Set(documents.map(doc => doc.category)).size}
                                    </p>
                                    <p className="text-sm text-text-secondary mt-2">
                                        Document categories
                                    </p>
                                </div>
                            </div>

                            {/* Intelligence Hub */}
                            <div className="mt-12">
                                <h4 className="text-2xl font-display font-semibold tracking-tight text-text-primary mb-8" style={{
                                    fontFamily: 'Outfit, sans-serif'
                                }}>
                                    Intelligence Hub
                                </h4>

                                {/* Portfolio Readiness & Vault Activity */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                    {/* Portfolio Readiness - Left */}
                                    <div className="p-8 rounded-vault-lg border" style={{
                                        background: 'linear-gradient(145deg, #0F172A, #020617)',
                                        borderColor: 'rgba(148, 163, 184, 0.08)'
                                    }}>
                                        <h5 className="text-xl font-display font-semibold text-text-primary mb-6" style={{
                                            fontFamily: 'Outfit, sans-serif'
                                        }}>
                                            Portfolio Readiness
                                        </h5>

                                        {(() => {
                                            const categories = ['Academics', 'Internships', 'Projects', 'Certifications']
                                            const filledCategories = categories.filter(cat =>
                                                documents.some(doc => doc.category === cat)
                                            ).length
                                            const readinessPercent = Math.round((filledCategories / categories.length) * 100)

                                            return (
                                                <div className="flex flex-col items-center">
                                                    {/* Circular Progress Gauge */}
                                                    <div className="relative w-48 h-48 mb-6">
                                                        <svg className="w-full h-full transform -rotate-90">
                                                            {/* Background circle */}
                                                            <circle
                                                                cx="96"
                                                                cy="96"
                                                                r="88"
                                                                stroke="rgba(148, 163, 184, 0.1)"
                                                                strokeWidth="12"
                                                                fill="none"
                                                            />
                                                            {/* Progress circle with gradient */}
                                                            <defs>
                                                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                    <stop offset="0%" stopColor="#38BDF8" />
                                                                    <stop offset="100%" stopColor="#2DD4BF" />
                                                                </linearGradient>
                                                            </defs>
                                                            <circle
                                                                cx="96"
                                                                cy="96"
                                                                r="88"
                                                                stroke="url(#progressGradient)"
                                                                strokeWidth="12"
                                                                fill="none"
                                                                strokeDasharray={`${2 * Math.PI * 88}`}
                                                                strokeDashoffset={`${2 * Math.PI * 88 * (1 - readinessPercent / 100)}`}
                                                                strokeLinecap="round"
                                                                style={{
                                                                    transition: 'stroke-dashoffset 1s ease-in-out',
                                                                    filter: 'drop-shadow(0 0 8px rgba(45, 212, 191, 0.4))'
                                                                }}
                                                            />
                                                        </svg>
                                                        {/* Center text */}
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                            <p className="text-5xl font-bold" style={{
                                                                background: 'linear-gradient(135deg, #38BDF8, #2DD4BF)',
                                                                WebkitBackgroundClip: 'text',
                                                                WebkitTextFillColor: 'transparent',
                                                                fontFamily: 'Outfit, sans-serif'
                                                            }}>
                                                                {readinessPercent}%
                                                            </p>
                                                            <p className="text-xs text-text-muted mt-1">Complete</p>
                                                        </div>
                                                    </div>

                                                    {/* Category Status */}
                                                    <div className="w-full space-y-2">
                                                        {categories.map(cat => {
                                                            const hasDoc = documents.some(doc => doc.category === cat)
                                                            return (
                                                                <div key={cat} className="flex items-center justify-between text-sm">
                                                                    <span className="text-text-secondary">{cat}</span>
                                                                    <span className={`px-2 py-1 rounded text-xs ${hasDoc
                                                                        ? 'bg-accent-teal/10 text-accent-teal'
                                                                        : 'bg-text-muted/10 text-text-muted'
                                                                        }`}>
                                                                        {hasDoc ? '✓ Added' : 'Pending'}
                                                                    </span>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })()}
                                    </div>

                                    {/* Vault Activity - Right */}
                                    <div className="p-8 rounded-vault-lg border" style={{
                                        background: 'linear-gradient(145deg, #0F172A, #020617)',
                                        borderColor: 'rgba(148, 163, 184, 0.08)'
                                    }}>
                                        <h5 className="text-xl font-display font-semibold text-text-primary mb-6" style={{
                                            fontFamily: 'Outfit, sans-serif'
                                        }}>
                                            Vault Activity
                                        </h5>

                                        <div className="space-y-4">
                                            {documents.length === 0 ? (
                                                <p className="text-text-muted text-sm">No recent activity</p>
                                            ) : (
                                                <>
                                                    {documents.slice(0, 3).map((doc, index) => (
                                                        <div key={doc._id} className="flex items-start gap-4 pb-4 border-b border-border-subtle last:border-0">
                                                            <div className="w-10 h-10 rounded-vault bg-accent-cyan/10 flex items-center justify-center flex-shrink-0">
                                                                <span className="text-accent-cyan text-lg">📄</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm text-text-primary font-medium truncate">
                                                                    New {doc.category} Vaulted
                                                                </p>
                                                                <p className="text-xs text-text-muted truncate mt-1">
                                                                    {doc.originalName}
                                                                </p>
                                                                <p className="text-xs text-text-muted mt-1" style={{
                                                                    fontFamily: 'JetBrains Mono, monospace'
                                                                }}>
                                                                    {new Date(doc.uploadDate).toLocaleDateString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {userData && (
                                                        <div className="flex items-start gap-4 pb-4">
                                                            <div className="w-10 h-10 rounded-vault bg-accent-teal/10 flex items-center justify-center flex-shrink-0">
                                                                <span className="text-accent-teal text-lg">✓</span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm text-text-primary font-medium">
                                                                    Account Created
                                                                </p>
                                                                <p className="text-xs text-text-muted mt-1" style={{
                                                                    fontFamily: 'JetBrains Mono, monospace'
                                                                }}>
                                                                    Welcome to EduVault
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Category Breakdown - Bottom */}
                                <div className="p-8 rounded-vault-lg border" style={{
                                    background: 'linear-gradient(145deg, #0F172A, #020617)',
                                    borderColor: 'rgba(148, 163, 184, 0.08)'
                                }}>
                                    <h5 className="text-xl font-display font-semibold text-text-primary mb-6" style={{
                                        fontFamily: 'Outfit, sans-serif'
                                    }}>
                                        Category Distribution
                                    </h5>

                                    {(() => {
                                        const categoryColors = {
                                            'Academics': { bg: '#38BDF8', text: 'Cyan' },
                                            'Internships': { bg: '#2DD4BF', text: 'Teal' },
                                            'Projects': { bg: '#818CF8', text: 'Violet' },
                                            'Certifications': { bg: '#FBBF24', text: 'Yellow' }
                                        }

                                        const categoryCounts = {
                                            'Academics': documents.filter(d => d.category === 'Academics').length,
                                            'Internships': documents.filter(d => d.category === 'Internships').length,
                                            'Projects': documents.filter(d => d.category === 'Projects').length,
                                            'Certifications': documents.filter(d => d.category === 'Certifications').length
                                        }

                                        const total = documents.length || 1

                                        return (
                                            <div className="space-y-6">
                                                {/* Horizontal Distribution Bar */}
                                                <div className="h-4 rounded-full overflow-hidden flex" style={{
                                                    background: '#111C33'
                                                }}>
                                                    {Object.entries(categoryCounts).map(([cat, count]) => {
                                                        const percentage = (count / total) * 100
                                                        return percentage > 0 ? (
                                                            <div
                                                                key={cat}
                                                                style={{
                                                                    width: `${percentage}%`,
                                                                    background: categoryColors[cat].bg,
                                                                    transition: 'width 0.5s ease-in-out'
                                                                }}
                                                            />
                                                        ) : null
                                                    })}
                                                </div>

                                                {/* Category Badges */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {Object.entries(categoryCounts).map(([cat, count]) => (
                                                        <div key={cat} className="flex items-center gap-3">
                                                            <div
                                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                                style={{ background: categoryColors[cat].bg }}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm text-text-primary font-medium truncate">
                                                                    {cat}
                                                                </p>
                                                                <p className="text-xs text-text-muted">
                                                                    {count} {count === 1 ? 'document' : 'documents'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Hidden Resume Component for Printing */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                {userData && documents.length > 0 && (
                    <ResumePDF
                        ref={resumeRef}
                        user={{
                            name: userData.fullName,
                            email: userData.email,
                            username: userData.username,
                            university: userData.university,
                            degree: userData.degree,
                            branch: userData.branch,
                            graduationYear: userData.graduationYear
                        }}
                        documents={documents}
                    />
                )}
            </div>
        </div>
    )
}
