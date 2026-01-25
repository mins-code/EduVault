import { useState, useEffect } from 'react'
import { X, Save, Sparkles, User, Award } from 'lucide-react'
import api from '../api'

export default function SkillManager() {
    const [skills, setSkills] = useState([])
    const [input, setInput] = useState('')
    const [bio, setBio] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    useEffect(() => {
        // Load initial data from localStorage
        const userStr = localStorage.getItem('user')
        if (userStr) {
            const user = JSON.parse(userStr)
            setSkills(user.skills || [])
            setBio(user.bio || '')
        }
    }, [])

    const handleAddSkill = (e) => {
        if (e.key === 'Enter' && input.trim()) {
            e.preventDefault()
            const newSkill = input.trim()
            if (!skills.includes(newSkill)) {
                setSkills([...skills, newSkill])
            }
            setInput('')
        }
    }

    const handleRemoveSkill = (skillToRemove) => {
        setSkills(skills.filter(skill => skill !== skillToRemove))
    }

    const handleSave = async () => {
        setLoading(true)
        setMessage({ type: '', text: '' })

        try {
            const token = localStorage.getItem('token')
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            }

            const response = await api.put('/api/auth/profile', {
                skills,
                bio
            }, config)

            if (response.data.success) {
                // Update localStorage
                const user = JSON.parse(localStorage.getItem('user'))
                const updatedUser = { ...user, skills, bio }
                localStorage.setItem('user', JSON.stringify(updatedUser))

                setMessage({ type: 'success', text: 'Profile updated successfully!' })

                // Clear message after 3 seconds
                setTimeout(() => setMessage({ type: '', text: '' }), 3000)
            }
        } catch (error) {
            console.error('Profile update error:', error)
            setMessage({ type: 'error', text: 'Failed to update profile' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="rounded-2xl border p-6 backdrop-blur-xl" style={{
            background: 'rgba(15, 23, 42, 0.6)',
            borderColor: 'rgba(56, 189, 248, 0.2)'
        }}>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Skills & Bio</h2>
            </div>

            {/* Bio Section */}
            <div className="mb-6">
                <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Short Bio
                </label>
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell recruiters about yourself..."
                    className="w-full h-24 bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                    maxLength={300}
                />
                <div className="text-right text-xs text-slate-500 mt-1">
                    {bio.length}/300
                </div>
            </div>

            {/* Skills Section */}
            <div className="mb-6">
                <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Skills
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleAddSkill}
                        placeholder="Type a skill and press Enter..."
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                </div>

                {/* Skills Container */}
                <div className="flex flex-wrap gap-2 mt-3">
                    {skills.map((skill, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-1 px-3 py-1 rounded-full text-sm border transition-all hover:scale-105"
                            style={{
                                background: 'rgba(6, 182, 212, 0.1)',
                                borderColor: 'rgba(6, 182, 212, 0.3)',
                                color: '#22d3ee'
                            }}
                        >
                            <span>{skill}</span>
                            <button
                                onClick={() => handleRemoveSkill(skill)}
                                className="hover:text-white transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    {skills.length === 0 && (
                        <p className="text-sm text-slate-500 italic">No skills added yet</p>
                    )}
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                <div className={`text-sm ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {message.text}
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-white transition-all hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)'
                    }}
                >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    )
}
