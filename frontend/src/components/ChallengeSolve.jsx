import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import {
    Play, Send, CheckCircle, XCircle, Award,
    Clock, Zap, AlertCircle, ArrowLeft, Code2
} from 'lucide-react'
import api from '../api'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { executeCode as executeCodeLocally } from '../utils/codeExecutor'
import { CHALLENGES } from '../data/challenges'

const ChallengeSolve = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    // State
    const [challenge, setChallenge] = useState(null)
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(true)
    const [executing, setExecuting] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [testResults, setTestResults] = useState([])
    const [executionTime, setExecutionTime] = useState(0)
    const [hasBadge, setHasBadge] = useState(false)
    const [badgeAwarded, setBadgeAwarded] = useState(false)
    const [allTestsPassed, setAllTestsPassed] = useState(false)

    // Fetch challenge on mount
    useEffect(() => {
        fetchChallenge()
        checkBadge()
    }, [id])

    const fetchChallenge = async () => {
        try {
            setLoading(true)

            // Find challenge from static array
            console.log('📥 Loading challenge:', id)
            const foundChallenge = CHALLENGES.find(c => c.slug === id)

            if (foundChallenge) {
                setChallenge(foundChallenge)
                setCode(foundChallenge.starterCode || '')
                console.log('✅ Loaded challenge:', foundChallenge.title)
            } else {
                console.log('⚠️  Challenge not found')
                setChallenge(null)
            }
        } catch (error) {
            console.error('Error loading challenge:', error)
            setChallenge(null)
        } finally {
            setLoading(false)
        }
    }

    const checkBadge = async () => {
        // Badge checking removed - implement later if needed
        setHasBadge(false)
    }

    const handleRunCode = async () => {
        try {
            setExecuting(true)
            setTestResults([])

            // Local browser execution only
            console.log('🖥️  Executing locally in browser...')
            const results = await executeCodeLocally(code, challenge.testCases, challenge.language)

            setTestResults(results.results || [])
            setExecutionTime(results.executionTime || 0)
            setAllTestsPassed(results.allPassed)

            console.log(`✅ Local execution complete: ${results.passedTests}/${results.totalTests} passed`)

        } catch (error) {
            console.error('Error executing code:', error)
            alert(error.message || 'Failed to execute code')
        } finally {
            setExecuting(false)
        }
    }

    const handleSubmit = async () => {
        if (!allTestsPassed) {
            alert('All tests must pass before submitting!')
            return
        }

        try {
            setSubmitting(true)

            // Send results to backend
            const response = await api.post('/api/execute/submit', {
                challengeId: id,
                code,
                language: challenge.language,
                results: testResults,
                passed: true,
                executionTime
            })

            if (response.data.success) {
                // Show success UI (confetti, modal, etc - using alert for now)
                alert(response.data.badgeAwarded ? '🎉 Challenge Completed! Badge Earned!' : '✅ Challenge Completed!')
                navigate('/challenges')
            }

        } catch (error) {
            console.error('Error submitting:', error)
            alert('Failed to submit solution')
        } finally {
            setSubmitting(false)
        }
    }

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-400 border-green-500/30 bg-green-500/10'
            case 'Medium': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
            case 'Hard': return 'text-red-400 border-red-500/30 bg-red-500/10'
            default: return 'text-slate-400 border-slate-500/30 bg-slate-500/10'
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen bg-bg-primary">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden ml-64">
                    <TopBar />
                    <main className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <Code2 className="w-16 h-16 text-cyan-400 animate-pulse mx-auto mb-4" />
                            <p className="text-slate-400 text-lg">Loading challenge...</p>
                        </div>
                    </main>
                </div>
            </div>
        )
    }

    if (!challenge) {
        return (
            <div className="flex h-screen bg-bg-primary">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden ml-64">
                    <TopBar />
                    <main className="flex-1 flex items-center justify-center">
                        <div className="text-center max-w-md">
                            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-text-primary mb-2">Challenge Not Found</h2>
                            <p className="text-slate-400 mb-6">
                                This challenge couldn't be found. Please return to the challenges list.
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/challenges')}
                                    className="w-full px-6 py-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/50 transition-all font-medium"
                                >
                                    ← Back to Challenges
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-bg-primary overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden ml-64">
                <TopBar />

                <main className="flex-1 overflow-y-auto p-8 pt-24">
                    {/* Header */}
                    <div className="mb-6">
                        <button
                            onClick={() => navigate('/challenges')}
                            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Challenges
                        </button>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <h1 className="text-4xl font-bold text-text-primary">
                                    {challenge.title}
                                </h1>
                                <span className={`px-3 py-1 rounded-lg border text-sm font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                                    {challenge.difficulty}
                                </span>
                                <span className="px-3 py-1 rounded-lg border border-slate-700/50 bg-slate-800/50 text-slate-300 text-sm">
                                    {challenge.language}
                                </span>
                            </div>

                            {hasBadge && (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30">
                                    <Award className="w-5 h-5 text-yellow-400" />
                                    <span className="text-yellow-400 font-medium">Badge Earned</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Badge Award Notification */}
                    {badgeAwarded && (
                        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 animate-pulse">
                            <div className="flex items-center gap-3">
                                <Award className="w-8 h-8 text-yellow-400" />
                                <div>
                                    <h3 className="text-lg font-bold text-yellow-400">🎉 Badge Awarded!</h3>
                                    <p className="text-yellow-200/80">Congratulations! You've mastered this challenge.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Panel - Description */}
                        <div className="space-y-6">
                            {/* Description */}
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-xl p-6">
                                <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                                    <Code2 className="w-5 h-5 text-cyan-400" />
                                    Problem Description
                                </h2>
                                <div className="prose prose-invert prose-cyan max-w-none">
                                    <p className="text-slate-300 whitespace-pre-wrap">{challenge.description}</p>
                                </div>
                            </div>

                            {/* Test Results */}
                            {testResults.length > 0 && (
                                <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                                            <Zap className="w-5 h-5 text-cyan-400" />
                                            Test Results
                                        </h2>
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <Clock className="w-4 h-4" />
                                            {executionTime}ms
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {testResults.map((test, index) => (
                                            <div
                                                key={index}
                                                className={`p-4 rounded-lg border ${test.passed
                                                    ? 'bg-green-500/10 border-green-500/30'
                                                    : 'bg-red-500/10 border-red-500/30'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {test.passed ? (
                                                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                                    )}
                                                    <div className="flex-1">
                                                        <p className={`font-medium ${test.passed ? 'text-green-400' : 'text-red-400'}`}>
                                                            {test.testName}
                                                        </p>
                                                        {!test.passed && (
                                                            <div className="mt-2 text-sm space-y-1">
                                                                <p className="text-slate-400">
                                                                    Expected: <span className="text-green-400">{test.expectedOutput}</span>
                                                                </p>
                                                                <p className="text-slate-400">
                                                                    Got: <span className="text-red-400">{test.actualOutput}</span>
                                                                </p>
                                                                {test.error && (
                                                                    <p className="text-red-400 mt-2">{test.error}</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Summary */}
                                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-400">
                                                Passed: {testResults.filter(t => t.passed).length} / {testResults.length}
                                            </span>
                                            {allTestsPassed && (
                                                <span className="text-green-400 font-medium flex items-center gap-1">
                                                    <CheckCircle className="w-4 h-4" />
                                                    All tests passed!
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Panel - Editor */}
                        <div className="space-y-6">
                            {/* Monaco Editor */}
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden">
                                <div className="p-4 border-b border-slate-700/50">
                                    <h2 className="text-lg font-bold text-text-primary">Code Editor</h2>
                                </div>
                                <div className="p-4">
                                    <Editor
                                        height="500px"
                                        language={challenge.language}
                                        theme="vs-dark"
                                        value={code}
                                        onChange={(value) => setCode(value || '')}
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 14,
                                            lineNumbers: 'on',
                                            scrollBeyondLastLine: false,
                                            automaticLayout: true,
                                            tabSize: 2,
                                            wordWrap: 'on'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={handleRunCode}
                                    disabled={executing}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Play className="w-5 h-5" />
                                    {executing ? 'Running...' : 'Run Code'}
                                </button>

                                <button
                                    onClick={handleSubmit}
                                    disabled={!allTestsPassed || submitting || hasBadge}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-green-400 border border-green-500/30 hover:border-green-500/50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-5 h-5" />
                                    {hasBadge ? 'Already Completed' : submitting ? 'Submitting...' : 'Submit Solution'}
                                </button>
                            </div>

                            {!allTestsPassed && testResults.length > 0 && (
                                <p className="text-sm text-slate-400 text-center">
                                    ⚠️ All tests must pass to submit your solution
                                </p>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default ChallengeSolve
