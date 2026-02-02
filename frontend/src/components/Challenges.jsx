import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Code2, Trophy, Clock, Zap, Award, Filter, RefreshCw, CheckCircle } from 'lucide-react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { CHALLENGES } from '../data/challenges'
import api from '../api'

const Challenges = () => {
    const navigate = useNavigate()

    const [challenges, setChallenges] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedDifficulty, setSelectedDifficulty] = useState('All')
    const [selectedLanguage, setSelectedLanguage] = useState('All')
    const [userProgress, setUserProgress] = useState({})

    useEffect(() => {
        fetchChallengesAndProgress()
    }, [])

    const fetchChallengesAndProgress = async () => {
        setLoading(true)
        try {
            // Load formatted static challenges
            const allChallenges = CHALLENGES

            // Fetch user submissions/badges to determine status
            try {
                const { data } = await api.get('/api/execute/submissions')

                // Map passed challenges
                const progressMap = {}
                if (data.success && data.submissions) {
                    data.submissions.forEach(sub => {
                        if (sub.status === 'Passed') {
                            progressMap[sub.challengeId.slug] = true
                        }
                    })
                }
                setUserProgress(progressMap)

                // Also could fetch global stats if needed, but for now just showing user completion
            } catch (err) {
                console.error('Failed to load user progress', err)
            }

            setChallenges(allChallenges)
        } catch (error) {
            console.error('Error loading challenges:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredChallenges = challenges.filter(challenge => {
        const difficultyMatch = selectedDifficulty === 'All' || challenge.difficulty === selectedDifficulty
        const languageMatch = selectedLanguage === 'All' ||
            (challenge.language === selectedLanguage) ||
            (selectedLanguage === 'javascript' && challenge.language === 'javascript') ||
            (selectedLanguage === 'python' && challenge.language === 'python') ||
            (selectedLanguage === 'java' && challenge.language === 'java') ||
            (selectedLanguage === 'cpp' && challenge.language === 'cpp')

        return difficultyMatch && languageMatch
    })

    const DifficultyBadge = ({ difficulty }) => {
        const colors = {
            Easy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            Hard: 'bg-red-500/20 text-red-400 border-red-500/30'
        }
        return (
            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colors[difficulty] || 'bg-slate-500/20 text-slate-400'}`}>
                {difficulty}
            </span>
        )
    }

    const LanguageIcon = ({ lang }) => {
        const styles = {
            'javascript': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            'python': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'java': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            'cpp': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
        }

        const displayMap = {
            'javascript': 'JavaScript',
            'python': 'Python',
            'java': 'Java',
            'cpp': 'C++'
        }

        return (
            <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${styles[lang] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                {displayMap[lang] || lang}
            </span>
        )
    }

    return (
        <div className="flex h-screen bg-bg-primary">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden ml-64">
                <TopBar />

                <main className="flex-1 overflow-y-auto p-8 pt-24">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3 mb-2">
                                    <Code2 className="w-10 h-10 text-cyan-400" />
                                    Coding Challenges
                                </h1>
                                <p className="text-slate-400">Practice your skills with curated challenges</p>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between bg-slate-900/60 backdrop-blur-xl p-2 rounded-2xl border border-white/5 shadow-xl">
                            <div className="flex items-center gap-2 p-1 overflow-x-auto hide-scrollbar w-full sm:w-auto">
                                {['All', 'JavaScript', 'Python', 'Java', 'C++'].map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => setSelectedLanguage(lang.toLowerCase() === 'all' ? 'All' : lang.toLowerCase() === 'c++' ? 'cpp' : lang.toLowerCase())}
                                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${(selectedLanguage === 'All' && lang === 'All') || selectedLanguage === (lang.toLowerCase() === 'c++' ? 'cpp' : lang.toLowerCase())
                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 ring-1 ring-white/10'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 px-4 w-full sm:w-auto">
                                <Filter className="w-4 h-4 text-slate-500" />
                                <select
                                    value={selectedDifficulty}
                                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                                    className="bg-transparent border-none text-slate-300 text-sm font-medium focus:ring-0 cursor-pointer py-2 pl-0 pr-8 w-full sm:w-auto hover:text-cyan-400 transition-colors"
                                >
                                    <option value="All">All Difficulties</option>
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                        </div>

                        {/* Challenges Grid */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Code2 className="w-12 h-12 text-cyan-400 animate-pulse" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredChallenges.map((challenge) => (
                                    <div
                                        key={challenge.slug}
                                        onClick={() => navigate(`/challenges/${challenge.slug}`)}
                                        className="relative bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:border-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group overflow-hidden"
                                    >
                                        {/* Subtle flash effect on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                                        <div className="flex flex-col h-full relative z-10">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-bold text-slate-100 group-hover:text-cyan-400 transition-colors pr-16">
                                                    {challenge.title}
                                                </h3>
                                            </div>

                                            <p className="text-slate-400 text-sm mb-6 line-clamp-2 font-medium flex-grow">
                                                {challenge.blurb}
                                            </p>

                                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <DifficultyBadge difficulty={challenge.difficulty} />
                                                    <LanguageIcon lang={challenge.language} />
                                                </div>

                                                <div className="flex gap-2 text-slate-500">
                                                    {userProgress[challenge.slug] ? (
                                                        <div className="flex items-center gap-1.5 bg-green-500/10 px-2.5 py-1 rounded-md border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                                                            <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                                                            <span className="text-xs font-bold text-green-400">Solved</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 bg-slate-950/30 px-2 py-1 rounded-md border border-white/5" title="Difficulty Score">
                                                            <Trophy className="w-3 h-3 text-slate-600" />
                                                            <span className="text-xs font-semibold text-slate-500">{challenge.difficulty === 'Easy' ? 10 : challenge.difficulty === 'Medium' ? 20 : 30} XP</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div >
        </div >
    )
}

export default Challenges
