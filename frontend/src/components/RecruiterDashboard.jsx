import { useState, useEffect } from 'react'
import { Search, LogOut, Bookmark, GraduationCap, Building2, ExternalLink, Filter } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

export default function RecruiterDashboard() {
    const navigate = useNavigate()

    // State for Omnibar & Filters
    const [skillSearch, setSkillSearch] = useState('')
    const [filters, setFilters] = useState({
        university: '',
        graduationYear: '',
        degree: '',
        branch: ''
    })

    const [activeTab, setActiveTab] = useState('all') // 'all' or 'bookmarked'
    const [candidates, setCandidates] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ total: 0, bookmarked: 0 })
    const [bookmarkedIds, setBookmarkedIds] = useState(new Set())

    // Fetch Candidates and Bookmarks
    const fetchCandidates = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()

            // Skill Search
            if (skillSearch) params.append('skill', skillSearch)

            // Filters
            if (filters.university) params.append('university', filters.university)
            if (filters.graduationYear) params.append('graduationYear', filters.graduationYear)
            if (filters.degree) params.append('degree', filters.degree)
            if (filters.branch) params.append('branch', filters.branch)

            const endpoint = activeTab === 'bookmarked'
                ? '/api/scout/bookmarks'
                : `/api/scout/search?${params.toString()}`

            const response = await api.get(endpoint)

            if (response.data.success) {
                if (activeTab === 'bookmarked') {
                    console.log('Fetching bookmarks tab:', response.data.bookmarks)
                    setCandidates(response.data.bookmarks)
                    // If in bookmarked tab, all are bookmarked obviously
                    setBookmarkedIds(new Set(response.data.bookmarks.map(c => c._id)))
                } else {
                    console.log('Fetching search results:', response.data.students)
                    setCandidates(response.data.students)
                }
            }

            // Always fetch current bookmarks to update the icons correctly in 'all' view
            if (activeTab === 'all') {
                const bookmarksRes = await api.get('/api/scout/bookmarks')
                if (bookmarksRes.data.success) {
                    console.log('Fetched bookmarks for icons:', bookmarksRes.data.bookmarks)
                    setBookmarkedIds(new Set(bookmarksRes.data.bookmarks.map(b => b._id)))
                    setStats(prev => ({ ...prev, bookmarked: bookmarksRes.data.bookmarks.length }))
                }
            }

        } catch (error) {
            console.error('Fetch error:', error)
        } finally {
            setLoading(false)
        }
    }

    // Debounce Fetch
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchCandidates()
        }, 500)
        return () => clearTimeout(timeoutId)
    }, [skillSearch, filters, activeTab])

    const handleLogout = () => {
        localStorage.removeItem('recruiterToken')
        localStorage.removeItem('recruiter')
        navigate('/recruiter-login')
    }

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value })
    }

    const handleToggleBookmark = async (studentId) => {
        const isBookmarked = bookmarkedIds.has(studentId)
        try {
            if (isBookmarked) {
                await api.delete(`/api/scout/bookmark/${studentId}`)
                setBookmarkedIds(prev => {
                    const next = new Set(prev)
                    next.delete(studentId)
                    return next
                })
                // If we are in the bookmarked tab, remove the card from the view immediately
                if (activeTab === 'bookmarked') {
                    setCandidates(prev => prev.filter(c => c._id !== studentId))
                }
            } else {
                await api.post(`/api/scout/bookmark/${studentId}`)
                setBookmarkedIds(prev => {
                    const next = new Set(prev)
                    next.add(studentId)
                    return next
                })
            }
        } catch (error) {
            console.error('Bookmark toggle error:', error)
        }
    }

    return (
        <div
            className="min-h-screen p-8"
            style={{
                background: 'linear-gradient(180deg, #0A0F1F 0%, #0B1220 50%, #020617 100%)',
                backgroundAttachment: 'fixed',
                fontFamily: 'Inter, sans-serif'
            }}
        >
            {/* Header */}
            <header className="flex justify-between items-start mb-10">
                <div>
                    <h1
                        className="text-4xl font-bold mb-2"
                        style={{
                            fontFamily: 'Outfit, sans-serif',
                            background: 'linear-gradient(135deg, #3B82F6 0%, #2DD4BF 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.02em'
                        }}
                    >
                        Talent Scout
                    </h1>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Building2 className="w-4 h-4" />
                        <span style={{ fontFamily: 'Inter, sans-serif' }}>Oracle</span>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300"
                    style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        color: '#94A3B8',
                        backdropFilter: 'blur(12px)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)'
                        e.currentTarget.style.color = '#EF4444'
                        e.currentTarget.style.boxShadow = '0 0 16px rgba(239, 68, 68, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)'
                        e.currentTarget.style.color = '#94A3B8'
                        e.currentTarget.style.boxShadow = 'none'
                    }}
                >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </header>

            {/* Search Container */}
            <div
                className="rounded-2xl p-8 mb-8 border transition-all duration-300 relative overflow-hidden"
                style={{
                    background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 0.85))',
                    borderColor: 'rgba(59, 130, 246, 0.2)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                }}
            >
                {/* Subtle gradient overlay */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '100%',
                        background: 'radial-gradient(circle at top left, rgba(59, 130, 246, 0.05), transparent 60%)',
                        pointerEvents: 'none',
                        zIndex: 0
                    }}
                />
                <div className="relative z-10">
                    {/* Main Search Input */}
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-4 w-5 h-5 text-blue-400 transition-colors duration-300" style={{ zIndex: 10 }} />
                        <input
                            type="text"
                            value={skillSearch}
                            onChange={(e) => setSkillSearch(e.target.value)}
                            placeholder="Search by skill (e.g., React, Python, Java)..."
                            className="w-full py-4 pl-12 pr-4 rounded-xl transition-all duration-300"
                            style={{
                                background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(2, 6, 23, 0.7))',
                                border: '1.5px solid rgba(59, 130, 246, 0.25)',
                                color: '#F1F5F9',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '15px',
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)'
                                e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.15), 0 8px 24px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                                e.target.style.background = 'linear-gradient(145deg, rgba(15, 23, 42, 1), rgba(2, 6, 23, 0.8))'
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(59, 130, 246, 0.25)'
                                e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
                                e.target.style.background = 'linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(2, 6, 23, 0.7))'
                            }}
                        />
                    </div>

                    {/* Filters Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                        <div className="space-y-2">
                            <label className="text-xs text-slate-300 flex items-center gap-1.5 font-semibold tracking-wide">
                                <Filter className="w-3.5 h-3.5 text-blue-400" /> University
                            </label>
                            <input
                                type="text"
                                name="university"
                                value={filters.university}
                                onChange={handleFilterChange}
                                placeholder="e.g., MIT, VIT"
                                className="w-full py-2.5 px-4 text-sm rounded-xl transition-all duration-300"
                                style={{
                                    background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(2, 6, 23, 0.7))',
                                    border: '1.5px solid rgba(59, 130, 246, 0.2)',
                                    color: '#F1F5F9',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.12), 0 4px 12px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.2)'
                                    e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-slate-300 font-semibold tracking-wide">Graduation Year</label>
                            <input
                                type="number"
                                name="graduationYear"
                                value={filters.graduationYear}
                                onChange={handleFilterChange}
                                placeholder="2025"
                                className="w-full py-2.5 px-4 text-sm rounded-xl transition-all duration-300"
                                style={{
                                    background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(2, 6, 23, 0.7))',
                                    border: '1.5px solid rgba(59, 130, 246, 0.2)',
                                    color: '#F1F5F9',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.12), 0 4px 12px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.2)'
                                    e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-slate-300 font-semibold tracking-wide">Degree</label>
                            <input
                                type="text"
                                name="degree"
                                value={filters.degree}
                                onChange={handleFilterChange}
                                placeholder="B.Tech, M.Sc"
                                className="w-full py-2.5 px-4 text-sm rounded-xl transition-all duration-300"
                                style={{
                                    background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(2, 6, 23, 0.7))',
                                    border: '1.5px solid rgba(59, 130, 246, 0.2)',
                                    color: '#F1F5F9',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.12), 0 4px 12px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.2)'
                                    e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-slate-300 font-semibold tracking-wide">Branch</label>
                            <input
                                type="text"
                                name="branch"
                                value={filters.branch}
                                onChange={handleFilterChange}
                                placeholder="Computer Science"
                                className="w-full py-2.5 px-4 text-sm rounded-xl transition-all duration-300"
                                style={{
                                    background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(2, 6, 23, 0.7))',
                                    border: '1.5px solid rgba(59, 130, 246, 0.2)',
                                    color: '#F1F5F9',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.12), 0 4px 12px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.2)'
                                    e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div
                className="flex items-center gap-3 mb-8 p-1.5 rounded-lg inline-flex"
                style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(148, 163, 184, 0.1)'
                }}
            >
                <button
                    onClick={() => setActiveTab('all')}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300"
                    style={{
                        background: activeTab === 'all'
                            ? 'linear-gradient(135deg, #3B82F6, #2DD4BF)'
                            : 'transparent',
                        color: activeTab === 'all' ? '#FFFFFF' : '#94A3B8',
                        boxShadow: activeTab === 'all' ? '0 4px 16px rgba(59, 130, 246, 0.3)' : 'none'
                    }}
                >
                    All Candidates ({activeTab === 'all' ? candidates.length : stats.total})
                </button>
                <button
                    onClick={() => setActiveTab('bookmarked')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300"
                    style={{
                        background: activeTab === 'bookmarked'
                            ? 'linear-gradient(135deg, #3B82F6, #2DD4BF)'
                            : 'transparent',
                        color: activeTab === 'bookmarked' ? '#FFFFFF' : '#94A3B8',
                        boxShadow: activeTab === 'bookmarked' ? '0 4px 16px rgba(59, 130, 246, 0.3)' : 'none'
                    }}
                >
                    <Bookmark className="w-4 h-4" />
                    Bookmarked ({bookmarkedIds.size})
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    // Skeletons
                    [...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="rounded-xl p-6 h-80 animate-pulse"
                            style={{
                                background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.6), rgba(2, 6, 23, 0.4))',
                                border: '1px solid rgba(148, 163, 184, 0.08)'
                            }}
                        />
                    ))
                ) : (
                    candidates.map((candidate, index) => (
                        <CandidateCard
                            key={candidate._id}
                            candidate={candidate}
                            index={index}
                            isBookmarked={bookmarkedIds.has(candidate._id)}
                            onToggleBookmark={handleToggleBookmark}
                        />
                    ))
                )}
            </div>

            {!loading && candidates.length === 0 && (
                <div className="text-center py-20">
                    <div
                        className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                        style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.2)'
                        }}
                    >
                        <Search className="w-10 h-10 text-blue-400" />
                    </div>
                    <p className="text-lg text-slate-400">No candidates found matching your criteria.</p>
                </div>
            )}
        </div>
    )
}

function CandidateCard({ candidate, index, isBookmarked, onToggleBookmark }) {
    return (
        <div
            className="group rounded-2xl p-6 border transition-all duration-500 flex flex-col h-full relative overflow-hidden"
            style={{
                background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 0.8))',
                borderColor: 'rgba(59, 130, 246, 0.15)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                transformOrigin: 'center'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.15)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
            }}
        >
            {/* Subtle gradient overlay */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '100%',
                    background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 50%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3
                            className="text-xl font-bold mb-1 transition-colors duration-300"
                            style={{
                                color: '#F1F5F9',
                                fontFamily: 'Outfit, sans-serif',
                                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                            }}
                        >
                            {candidate.fullName}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <GraduationCap className="w-4 h-4" />
                            <span style={{ fontFamily: 'Inter, sans-serif' }}>{candidate.university}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => onToggleBookmark(candidate._id)}
                        className="p-2.5 rounded-xl transition-all duration-300 relative z-20"
                        style={{
                            background: isBookmarked
                                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(45, 212, 191, 0.15))'
                                : 'rgba(71, 85, 105, 0.15)',
                            color: isBookmarked ? '#60A5FA' : '#94A3B8',
                            border: `1.5px solid ${isBookmarked ? 'rgba(59, 130, 246, 0.4)' : 'rgba(148, 163, 184, 0.2)'}`,
                            boxShadow: isBookmarked ? '0 0 20px rgba(59, 130, 246, 0.3)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                            if (!isBookmarked) {
                                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'
                                e.currentTarget.style.color = '#60A5FA'
                                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'
                            } else {
                                e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isBookmarked) {
                                e.currentTarget.style.background = 'rgba(71, 85, 105, 0.15)'
                                e.currentTarget.style.color = '#94A3B8'
                                e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)'
                            } else {
                                e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
                            }
                        }}
                    >
                        <Bookmark className="w-5 h-5" fill={isBookmarked ? "currentColor" : "none"} />
                    </button>
                </div>

                {/* Bio & Skills */}
                <div className="mb-6 flex-grow">
                    {candidate.bio && (
                        <p
                            className="text-sm mb-4 line-clamp-2 min-h-[40px]"
                            style={{
                                color: '#CBD5E1',
                                fontFamily: 'Inter, sans-serif',
                                lineHeight: '1.6'
                            }}
                        >
                            {candidate.bio}
                        </p>
                    )}

                    {candidate.skills && candidate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {candidate.skills.slice(0, 3).map((skill, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1.5 text-xs rounded-full font-medium transition-all duration-300"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.15), rgba(20, 184, 166, 0.1))',
                                        color: '#5EEAD4',
                                        border: '1px solid rgba(45, 212, 191, 0.3)',
                                        boxShadow: '0 2px 8px rgba(45, 212, 191, 0.15)'
                                    }}
                                >
                                    {skill}
                                </span>
                            ))}
                            {candidate.skills.length > 3 && (
                                <span
                                    className="text-xs py-1.5 px-3 rounded-full"
                                    style={{
                                        color: '#94A3B8',
                                        fontFamily: 'JetBrains Mono, monospace',
                                        background: 'rgba(71, 85, 105, 0.2)',
                                        border: '1px solid rgba(148, 163, 184, 0.2)'
                                    }}
                                >
                                    +{candidate.skills.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    <div
                        className="space-y-1.5 mb-6 text-sm p-3 rounded-lg"
                        style={{
                            color: '#CBD5E1',
                            fontFamily: 'JetBrains Mono, monospace',
                            background: 'rgba(15, 23, 42, 0.5)',
                            border: '1px solid rgba(148, 163, 184, 0.1)'
                        }}
                    >
                        <p><span style={{ color: '#94A3B8', fontWeight: 600 }}>Degree:</span> {candidate.degree} in {candidate.branch || '...'}</p>
                        <p><span style={{ color: '#94A3B8', fontWeight: 600 }}>Graduating:</span> {candidate.graduationYear}</p>
                    </div>
                </div>

                {/* Link to Portfolio - Opens in new tab */}
                <div className="mt-auto">
                    <Link
                        to={`/portfolio/${candidate.username}`}
                        target="_blank"
                        className="block w-full"
                    >
                        <button
                            className="w-full font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, #3B82F6 0%, #2DD4BF 100%)',
                                color: '#FFFFFF',
                                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.03)'
                                e.currentTarget.style.boxShadow = '0 8px 30px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)'
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                            }}
                        >
                            View Profile
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}