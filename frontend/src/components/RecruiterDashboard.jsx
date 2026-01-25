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

    // Fetch Candidates
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
                    setCandidates(response.data.bookmarks)
                } else {
                    setCandidates(response.data.students)
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

    return (
        <div className="min-h-screen bg-[#0A0F1F] text-slate-200 font-sans p-8">
            {/* Header */}
            <header className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#3B82F6] mb-1">Talent Scout</h1>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Building2 className="w-4 h-4" />
                        <span>Oracle</span>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </header>

            {/* Search Container */}
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 mb-8">
                {/* Main Search Input */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        value={skillSearch}
                        onChange={(e) => setSkillSearch(e.target.value)}
                        placeholder="Search by skill (e.g., React, Python, Java)..."
                        className="w-full bg-[#1F2937] border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 flex items-center gap-1">
                            <Filter className="w-3 h-3" /> University
                        </label>
                        <input
                            type="text"
                            name="university"
                            value={filters.university}
                            onChange={handleFilterChange}
                            placeholder="e.g., MIT, VIT"
                            className="w-full bg-[#1F2937] border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs text-slate-400">Graduation Year</label>
                        <input
                            type="number"
                            name="graduationYear"
                            value={filters.graduationYear}
                            onChange={handleFilterChange}
                            placeholder="2025"
                            className="w-full bg-[#1F2937] border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs text-slate-400">Degree</label>
                        <input
                            type="text"
                            name="degree"
                            value={filters.degree}
                            onChange={handleFilterChange}
                            placeholder="B.Tech, M.Sc"
                            className="w-full bg-[#1F2937] border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs text-slate-400">Branch</label>
                        <input
                            type="text"
                            name="branch"
                            value={filters.branch}
                            onChange={handleFilterChange}
                            placeholder="Computer Science"
                            className="w-full bg-[#1F2937] border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                        }`}
                >
                    All Candidates ({activeTab === 'all' ? candidates.length : stats.total})
                </button>
                <button
                    onClick={() => setActiveTab('bookmarked')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'bookmarked'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                        }`}
                >
                    <Bookmark className="w-4 h-4" />
                    Bookmarked ({activeTab === 'bookmarked' ? candidates.length : stats.bookmarked})
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    // Skeletons
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="bg-[#111827] border border-slate-800 rounded-xl p-6 h-64 animate-pulse" />
                    ))
                ) : (
                    candidates.map((candidate) => (
                        <CandidateCard key={candidate._id} candidate={candidate} />
                    ))
                )}
            </div>

            {!loading && candidates.length === 0 && (
                <div className="text-center py-20 text-slate-500">
                    <p>No candidates found matching your criteria.</p>
                </div>
            )}
        </div>
    )
}

function CandidateCard({ candidate }) {
    const [isBookmarked, setIsBookmarked] = useState(false)

    const toggleBookmark = async () => {
        // Implement Bookmark API call here
        setIsBookmarked(!isBookmarked)
    }

    return (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                        {candidate.fullName}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <GraduationCap className="w-4 h-4" />
                        <span>{candidate.university}</span>
                    </div>
                </div>
                <button
                    onClick={toggleBookmark}
                    className={`p-1.5 rounded-md transition-colors ${isBookmarked ? 'text-blue-500' : 'text-slate-600 hover:text-blue-500 hover:bg-blue-500/10'
                        }`}
                >
                    <Bookmark className="w-5 h-5" fill={isBookmarked ? "currentColor" : "none"} />
                </button>
            </div>

            {/* Bio & Skills */}
            <div className="mb-6">
                {candidate.bio && (
                    <p className="text-sm text-slate-400 mb-3 line-clamp-2 min-h-[40px]">
                        {candidate.bio}
                    </p>
                )}

                {candidate.skills && candidate.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {candidate.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-slate-800 text-blue-300 text-xs rounded border border-slate-700">
                                {skill}
                            </span>
                        ))}
                        {candidate.skills.length > 3 && (
                            <span className="text-xs text-slate-500 py-1">+{candidate.skills.length - 3}</span>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-1 mb-6 text-sm text-slate-400">
                <p><span className="text-slate-500">Degree:</span> {candidate.degree} in {candidate.branch || '...'}</p>
                <p><span className="text-slate-500">Graduating:</span> {candidate.graduationYear}</p>
            </div>

            {/* Link to Portfolio - Opens in new tab */}
            <Link
                to={`/portfolio/${candidate.username}`}
                target="_blank"
                className="block w-full mt-auto"
            >
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                    View Profile
                    <ExternalLink className="w-4 h-4" />
                </button>
            </Link>
        </div>
    )
}
