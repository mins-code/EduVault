import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react'
import api from '../api'

export default function CandidateCard({ student, isBookmarked, onBookmarkToggle }) {
    const navigate = useNavigate()
    const [bookmarking, setBookmarking] = useState(false)

    const handleBookmark = async (e) => {
        e.stopPropagation()
        setBookmarking(true)

        try {
            const token = localStorage.getItem('recruiterToken')
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            }

            if (isBookmarked) {
                await api.delete(`/api/scout/bookmark/${student._id}`, config)
            } else {
                await api.post(`/api/scout/bookmark/${student._id}`, {}, config)
            }

            onBookmarkToggle(student._id)
        } catch (error) {
            console.error('Bookmark error:', error)
        } finally {
            setBookmarking(false)
        }
    }

    const handleViewProfile = () => {
        // Navigate to public portfolio using username (derived from email)
        const username = student.email.split('@')[0]
        navigate(`/portfolio/${username}`)
    }

    return (
        <div
            className="border rounded-xl p-6 transition-all duration-300 hover:shadow-xl cursor-pointer group"
            style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
                borderColor: 'rgba(71, 85, 105, 0.3)'
            }}
            onClick={handleViewProfile}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                        {student.fullName}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <GraduationCap className="w-4 h-4" />
                        <span>{student.university}</span>
                    </div>
                </div>

                {/* Bookmark Button */}
                <button
                    onClick={handleBookmark}
                    disabled={bookmarking}
                    className="p-2 rounded-lg transition-all duration-300 hover:bg-blue-500/10"
                    style={{
                        color: isBookmarked ? '#3B82F6' : '#94A3B8'
                    }}
                >
                    {isBookmarked ? (
                        <BookmarkCheck className="w-5 h-5" />
                    ) : (
                        <Bookmark className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Education Details */}
            <div className="mb-4 space-y-1">
                <p className="text-gray-300 text-sm">
                    <span className="text-gray-500">Degree:</span> {student.degree} in {student.branch}
                </p>
                <p className="text-gray-300 text-sm">
                    <span className="text-gray-500">Graduating:</span> {student.graduationYear}
                </p>
            </div>

            {/* Bio */}
            {student.bio && (
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {student.bio}
                </p>
            )}

            {/* Skills Badges */}
            {student.skills && student.skills.length > 0 && (
                <div className="mb-4">
                    <p className="text-gray-500 text-xs mb-2">Top Skills</p>
                    <div className="flex flex-wrap gap-2">
                        {student.skills.slice(0, 3).map((skill, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 rounded-full text-xs font-medium border"
                                style={{
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    borderColor: 'rgba(59, 130, 246, 0.3)',
                                    color: '#60A5FA'
                                }}
                            >
                                {skill}
                            </span>
                        ))}
                        {student.skills.length > 3 && (
                            <span className="px-3 py-1 text-xs text-gray-500">
                                +{student.skills.length - 3} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* View Profile Button */}
            <button
                onClick={handleViewProfile}
                className="w-full px-4 py-2 rounded-lg font-medium text-white transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg"
                style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)'
                }}
            >
                View Profile
                <ExternalLink className="w-4 h-4" />
            </button>
        </div>
    )
}
