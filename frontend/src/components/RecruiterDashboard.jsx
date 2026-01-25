import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, LogOut, Building2, Bookmark, Users, X } from 'lucide-react'
import api from '../api'
import CandidateCard from './CandidateCard'

export default function RecruiterDashboard() {
    const navigate = useNavigate()
    const [recruiter, setRecruiter] = useState(null)
    const [students, setStudents] = useState([])
    const [bookmarkedIds, setBookmarkedIds] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filters, setFilters] = useState({
        university: '',
        graduationYear: '',
        degree: '',
        branch: ''
    })
    const [showBookmarks, setShowBookmarks] = useState(false)

    useEffect(() => {
        // Check authentication
        const recruiterData = localStorage.getItem('recruiter')
        if (!recruiterData) {
            navigate('/recruiter/auth')
            return
        }

        setRecruiter(JSON.parse(recruiterData))
        fetchStudents()
        fetchBookmarks()
    }, [navigate])

    const fetchStudents = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()

            if (searchTerm) params.append('skill', searchTerm)
            if (filters.university) params.append('university', filters.university)
            if (filters.graduationYear) params.append('graduationYear', filters.graduationYear)
            if (filters.degree) params.append('degree', filters.degree)
            if (filters.branch) params.append('branch', filters.branch)

            const response = await api.get(`/api/scout/search?${params.toString()}`)
            setStudents(response.data.students || [])
        } catch (error) {
            console.error('Search error:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchBookmarks = async () => {
        try {
            const token = localStorage.getItem('recruiterToken')
            const response = await api.get('/api/scout/bookmarks', {
                headers: { Authorization: `Bearer ${token}` }
            })

            const ids = response.data.bookmarks.map(b => b._id)
            setBookmarkedIds(ids)
        } catch (error) {
            console.error('Fetch bookmarks error:', error)
        }
    }

    const handleSearch = () => {
        fetchStudents()
    }

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const handleBookmarkToggle = (studentId) => {
        setBookmarkedIds(prev => {
            if (prev.includes(studentId)) {
                return prev.filter(id => id !== studentId)
            } else {
                return [...prev, studentId]
            }
        })
    }

    const handleLogout = () => {
        localStorage.removeItem('recruiterToken')
        localStorage.removeItem('recruiter')
        localStorage.removeItem('recruiterId')
        navigate('/')
    }

    const clearFilters = () => {
        setSearchTerm('')
        setFilters({
            university: '',
            graduationYear: '',
            degree: '',
            branch: ''
        })
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStudents()
        }, 500)
        return () => clearTimeout(timer)
    }, [searchTerm, filters])

    const displayedStudents = showBookmarks
        ? students.filter(s => bookmarkedIds.includes(s._id))
        : students

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">

                {/* Top Bar */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold mb-2" style={{
                            background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontFamily: 'Outfit, sans-serif'
                        }}>
                            Talent Scout
                        </h1>
                        {recruiter && (
                            <div className="flex items-center gap-2 text-gray-400">
                                <Building2 className="w-4 h-4" />
                                <span>{recruiter.companyName}</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/50 text-gray-400 hover:text-red-400"
                        style={{
                            borderColor: 'rgba(71, 85, 105, 0.3)'
                        }}
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="mb-8 border rounded-xl p-6" style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
                    borderColor: 'rgba(71, 85, 105, 0.3)'
                }}>
                    {/* Search Bar */}
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by skill (e.g., React, Python, Java)..."
                                className="w-full pl-12 pr-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    borderColor: 'rgba(71, 85, 105, 0.4)',
                                    color: '#E2E8F0'
                                }}
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                <Filter className="w-3 h-3 inline mr-1" />
                                University
                            </label>
                            <input
                                type="text"
                                value={filters.university}
                                onChange={(e) => handleFilterChange('university', e.target.value)}
                                placeholder="e.g., MIT, VIT"
                                className="w-full px-3 py-2 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    borderColor: 'rgba(71, 85, 105, 0.4)',
                                    color: '#E2E8F0',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Graduation Year</label>
                            <input
                                type="number"
                                value={filters.graduationYear}
                                onChange={(e) => handleFilterChange('graduationYear', e.target.value)}
                                placeholder="2025"
                                min="2020"
                                max="2030"
                                className="w-full px-3 py-2 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    borderColor: 'rgba(71, 85, 105, 0.4)',
                                    color: '#E2E8F0',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Degree</label>
                            <input
                                type="text"
                                value={filters.degree}
                                onChange={(e) => handleFilterChange('degree', e.target.value)}
                                placeholder="B.Tech, M.Sc"
                                className="w-full px-3 py-2 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    borderColor: 'rgba(71, 85, 105, 0.4)',
                                    color: '#E2E8F0',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Branch</label>
                            <input
                                type="text"
                                value={filters.branch}
                                onChange={(e) => handleFilterChange('branch', e.target.value)}
                                placeholder="Computer Science"
                                className="w-full px-3 py-2 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    borderColor: 'rgba(71, 85, 105, 0.4)',
                                    color: '#E2E8F0',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>
                    </div>

                    {/* Clear Filters */}
                    {(searchTerm || filters.university || filters.graduationYear || filters.degree || filters.branch) && (
                        <button
                            onClick={clearFilters}
                            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Clear All Filters
                        </button>
                    )}
                </div>

                {/* View Toggle */}
                <div className="mb-6 flex gap-4">
                    <button
                        onClick={() => setShowBookmarks(false)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${!showBookmarks
                            ? 'text-white shadow-lg'
                            : 'text-gray-400 hover:text-gray-300'
                            }`}
                        style={!showBookmarks ? {
                            background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)'
                        } : {}}
                    >
                        <Users className="w-4 h-4" />
                        All Candidates ({students.length})
                    </button>

                    <button
                        onClick={() => setShowBookmarks(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${showBookmarks
                            ? 'text-white shadow-lg'
                            : 'text-gray-400 hover:text-gray-300'
                            }`}
                        style={showBookmarks ? {
                            background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)'
                        } : {}}
                    >
                        <Bookmark className="w-4 h-4" />
                        Bookmarked ({bookmarkedIds.length})
                    </button>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center gap-2 text-blue-400">
                            <span className="loading-dot">•</span>
                            <span className="loading-dot">•</span>
                            <span className="loading-dot">•</span>
                        </div>
                    </div>
                ) : displayedStudents.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-400 text-lg">
                            {showBookmarks ? 'No bookmarked candidates yet' : 'No candidates found'}
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                            {showBookmarks ? 'Start bookmarking candidates to build your talent pool' : 'Try adjusting your search filters'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedStudents.map((student) => (
                            <CandidateCard
                                key={student._id}
                                student={student}
                                isBookmarked={bookmarkedIds.includes(student._id)}
                                onBookmarkToggle={handleBookmarkToggle}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
