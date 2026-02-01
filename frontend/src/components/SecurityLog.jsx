import { useState, useEffect } from 'react'
import { Shield, Eye, MapPin, Monitor, Clock, Users, TrendingUp } from 'lucide-react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import api from '../api'

export default function SecurityLog() {
    const [analytics, setAnalytics] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
        try {
            setLoading(true)
            const response = await api.get('/api/analytics/my-traffic')

            if (response.data.success) {
                setAnalytics(response.data.analytics)
            }
        } catch (err) {
            console.error('Analytics fetch error:', err)
            setError('Failed to load surveillance data')
        } finally {
            setLoading(false)
        }
    }

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp)
        const time = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
        const dateStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
        return { time, date: dateStr }
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
                            {/* Header */}
                            <div className="mb-12">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                                        <Shield className="w-8 h-8 text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-4xl font-display font-bold tracking-tight text-white">
                                            🔒 Vault Surveillance
                                        </h3>
                                        <p className="text-slate-400 text-lg mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                            SYSTEM MONITORING ACTIVE • REAL-TIME TRACKING ENABLED
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {loading && (
                                <div className="text-center py-20">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
                                    <p className="text-green-400 mt-4" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                        LOADING SURVEILLANCE DATA...
                                    </p>
                                </div>
                            )}

                            {error && (
                                <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30">
                                    <p className="text-red-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                        ❌ ERROR: {error}
                                    </p>
                                </div>
                            )}

                            {!loading && !error && analytics && (
                                <>
                                    {/* Analytics Summary Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                        {/* Total Views */}
                                        <div
                                            className="p-6 rounded-xl border transition-all duration-300 hover:scale-105"
                                            style={{
                                                background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 0.85))',
                                                borderColor: 'rgba(34, 197, 94, 0.3)',
                                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <Eye className="w-5 h-5 text-green-400" />
                                                <TrendingUp className="w-4 h-4 text-green-400" />
                                            </div>
                                            <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                {analytics.totalViews}
                                            </div>
                                            <div className="text-xs text-slate-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                TOTAL VIEWS
                                            </div>
                                        </div>

                                        {/* Unique Visitors */}
                                        <div
                                            className="p-6 rounded-xl border transition-all duration-300 hover:scale-105"
                                            style={{
                                                background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 0.85))',
                                                borderColor: 'rgba(59, 130, 246, 0.3)',
                                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <Users className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                {analytics.uniqueVisitors}
                                            </div>
                                            <div className="text-xs text-slate-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                UNIQUE VISITORS
                                            </div>
                                        </div>

                                        {/* Recruiter Views */}
                                        <div
                                            className="p-6 rounded-xl border transition-all duration-300 hover:scale-105"
                                            style={{
                                                background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 0.85))',
                                                borderColor: 'rgba(168, 85, 247, 0.3)',
                                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <Shield className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                {analytics.recruiterViews}
                                            </div>
                                            <div className="text-xs text-slate-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                RECRUITER VIEWS
                                            </div>
                                        </div>

                                        {/* Top Location */}
                                        <div
                                            className="p-6 rounded-xl border transition-all duration-300 hover:scale-105"
                                            style={{
                                                background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 0.85))',
                                                borderColor: 'rgba(45, 212, 191, 0.3)',
                                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <MapPin className="w-5 h-5 text-teal-400" />
                                            </div>
                                            <div className="text-lg font-bold text-white mb-1 truncate" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                {analytics.topLocations[0]?.location || 'N/A'}
                                            </div>
                                            <div className="text-xs text-slate-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                TOP LOCATION
                                            </div>
                                        </div>
                                    </div>

                                    {/* Access Log */}
                                    <div
                                        className="rounded-2xl border p-8 mb-8"
                                        style={{
                                            background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 0.85))',
                                            borderColor: 'rgba(34, 197, 94, 0.2)',
                                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                                        }}
                                    >
                                        <div className="flex items-center gap-3 mb-6">
                                            <Monitor className="w-6 h-6 text-green-400" />
                                            <h4 className="text-xl font-bold text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                🖥️ ACCESS LOG
                                            </h4>
                                        </div>

                                        <div className="space-y-3">
                                            {analytics.recentVisits.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <p className="text-slate-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                        NO ACCESS EVENTS RECORDED
                                                    </p>
                                                </div>
                                            ) : (
                                                analytics.recentVisits.map((visit, index) => {
                                                    const { time, date } = formatTimestamp(visit.timestamp)
                                                    const isRecruiter = visit.viewerRole === 'recruiter'

                                                    return (
                                                        <div
                                                            key={index}
                                                            className="p-4 rounded-lg border transition-all duration-300 hover:border-green-500/50"
                                                            style={{
                                                                background: 'rgba(0, 0, 0, 0.3)',
                                                                borderColor: 'rgba(148, 163, 184, 0.1)'
                                                            }}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <span className="text-green-400 font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                                            [{time}]
                                                                        </span>
                                                                        <span className="text-green-400 font-semibold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                                            ✓ ACCESS GRANTED
                                                                        </span>
                                                                        <span
                                                                            className={`px-2 py-0.5 rounded text-xs font-bold ${isRecruiter ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                                                                                }`}
                                                                            style={{ fontFamily: 'JetBrains Mono, monospace' }}
                                                                        >
                                                                            {visit.viewerRole.toUpperCase()}
                                                                        </span>
                                                                        {isRecruiter && visit.recruiterCompany && (
                                                                            <span className="text-purple-300 text-xs font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                                                @ {visit.recruiterCompany}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-4 text-sm text-slate-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                                        <span className="flex items-center gap-1">
                                                                            <MapPin className="w-3 h-3" />
                                                                            {visit.location}
                                                                        </span>
                                                                        <span>•</span>
                                                                        <span className="flex items-center gap-1">
                                                                            <Monitor className="w-3 h-3" />
                                                                            {visit.browser}/{visit.os}
                                                                        </span>
                                                                        <span>•</span>
                                                                        <span className="flex items-center gap-1">
                                                                            <Clock className="w-3 h-3" />
                                                                            {date}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            )}
                                        </div>
                                    </div>

                                    {/* Top Locations */}
                                    {analytics.topLocations.length > 0 && (
                                        <div
                                            className="rounded-2xl border p-8"
                                            style={{
                                                background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 0.85))',
                                                borderColor: 'rgba(45, 212, 191, 0.2)',
                                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                                            }}
                                        >
                                            <div className="flex items-center gap-3 mb-6">
                                                <MapPin className="w-6 h-6 text-teal-400" />
                                                <h4 className="text-xl font-bold text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                    🌍 TOP LOCATIONS
                                                </h4>
                                            </div>

                                            <div className="space-y-3">
                                                {analytics.topLocations.map((loc, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between p-3 rounded-lg"
                                                        style={{
                                                            background: 'rgba(0, 0, 0, 0.3)',
                                                            border: '1px solid rgba(45, 212, 191, 0.1)'
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-teal-400 font-bold text-lg" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                                #{index + 1}
                                                            </span>
                                                            <span className="text-white font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                                {loc.location}
                                                            </span>
                                                        </div>
                                                        <span className="text-teal-400 font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                            {loc.count} views
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
