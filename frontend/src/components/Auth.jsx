import { useState } from 'react'
import { Shield, Lock, Mail, User, GraduationCap, BookOpen, Calendar, CheckCircle, AlertCircle, Building2, Briefcase } from 'lucide-react'
import api from '../api'

export default function Auth() {
    const [userType, setUserType] = useState('student')
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })
    const [showMessage, setShowMessage] = useState(false)

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        university: '',
        degree: '',
        branch: '',
        graduationYear: '',
        companyName: '',
        companyWebsite: ''
    })

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        if (message.text) {
            setShowMessage(false)
            setTimeout(() => setMessage({ type: '', text: '' }), 300)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setShowMessage(false)
        setMessage({ type: '', text: '' })

        try {
            if (userType === 'student') {
                if (isLogin) {
                    const response = await api.post('/api/auth/login', {
                        email: formData.email,
                        password: formData.password
                    })

                    if (response.data.success) {
                        localStorage.setItem('token', response.data.token)
                        localStorage.setItem('user', JSON.stringify(response.data.user))
                        localStorage.setItem('userId', response.data.user.id)

                        setMessage({
                            type: 'success',
                            text: 'Login successful! Redirecting to Dashboard...'
                        })
                        setShowMessage(true)

                        setTimeout(() => {
                            window.location.replace('/dashboard')
                        }, 1500)
                    }
                } else {
                    const response = await api.post('/api/auth/register', {
                        fullName: formData.fullName,
                        email: formData.email,
                        password: formData.password,
                        university: formData.university,
                        degree: formData.degree,
                        branch: formData.branch,
                        graduationYear: parseInt(formData.graduationYear)
                    })

                    if (response.data.success) {
                        setMessage({
                            type: 'success',
                            text: response.data.message
                        })
                        setShowMessage(true)

                        setFormData({
                            fullName: '',
                            email: '',
                            password: '',
                            university: '',
                            degree: '',
                            branch: '',
                            graduationYear: '',
                            companyName: '',
                            companyWebsite: ''
                        })

                        setTimeout(() => {
                            setIsLogin(true)
                            setShowMessage(false)
                            setTimeout(() => setMessage({ type: '', text: '' }), 300)
                        }, 2000)
                    }
                }
            } else {
                if (isLogin) {
                    const response = await api.post('/api/recruiters/login', {
                        email: formData.email,
                        password: formData.password
                    })

                    if (response.data.success) {
                        localStorage.setItem('recruiterToken', response.data.token)
                        localStorage.setItem('recruiter', JSON.stringify(response.data.recruiter))

                        setMessage({
                            type: 'success',
                            text: 'Login successful! Redirecting to Talent Scout...'
                        })
                        setShowMessage(true)

                        setTimeout(() => {
                            window.location.replace('/recruiter/dashboard')
                        }, 1500)
                    }
                } else {
                    const response = await api.post('/api/recruiters/register', {
                        fullName: formData.fullName,
                        email: formData.email,
                        password: formData.password,
                        companyName: formData.companyName,
                        companyWebsite: formData.companyWebsite
                    })

                    if (response.data.success) {
                        setMessage({
                            type: 'success',
                            text: 'Account created! Please login to continue.'
                        })
                        setShowMessage(true)

                        setFormData({
                            fullName: '',
                            email: '',
                            password: '',
                            university: '',
                            degree: '',
                            branch: '',
                            graduationYear: '',
                            companyName: '',
                            companyWebsite: ''
                        })

                        setTimeout(() => {
                            setIsLogin(true)
                            setShowMessage(false)
                            setTimeout(() => setMessage({ type: '', text: '' }), 300)
                        }, 2000)
                    }
                }
            }
        } catch (error) {
            console.error('Auth error:', error)
            const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.'

            setMessage({
                type: 'error',
                text: errorMessage
            })
            setShowMessage(true)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0B1120] to-black">
            <div className="w-full max-w-md">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{
                        background: userType === 'student'
                            ? 'linear-gradient(135deg, #38BDF8, #2DD4BF)'
                            : 'linear-gradient(135deg, #3B82F6, #475569)',
                        boxShadow: userType === 'student'
                            ? '0 0 32px rgba(56, 189, 248, 0.5), 0 0 64px rgba(45, 212, 191, 0.3)'
                            : '0 0 32px rgba(59, 130, 246, 0.4), 0 0 64px rgba(71, 85, 105, 0.3)'
                    }}>
                        {userType === 'student' ? (
                            <Shield className="w-10 h-10 text-white" strokeWidth={2.5} />
                        ) : (
                            <Briefcase className="w-10 h-10 text-white" strokeWidth={2.5} />
                        )}
                    </div>
                    <h1
                        className="text-5xl font-bold mb-2"
                        style={{
                            fontFamily: 'Outfit, sans-serif',
                            letterSpacing: '-0.02em',
                            color: userType === 'student' ? '#38BDF8' : '#3B82F6'
                        }}
                    >
                        EduVault
                    </h1>
                    <p className="text-slate-400" style={{
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        {userType === 'student' ? 'Your Secure Digital Locker' : 'Talent Scout Portal'}
                    </p>
                </div>

                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-8">

                    <div className="bg-slate-900/50 p-1 rounded-lg border border-slate-700/50 mb-6">
                        <div className="flex">
                            <button
                                onClick={() => setUserType('student')}
                                className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all duration-300 flex items-center justify-center gap-2 ${userType === 'student'
                                    ? 'bg-gradient-to-r from-blue-600 to-slate-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                <GraduationCap className="w-4 h-4" />
                                Student
                            </button>
                            <button
                                onClick={() => setUserType('recruiter')}
                                className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all duration-300 flex items-center justify-center gap-2 ${userType === 'recruiter'
                                    ? 'bg-gradient-to-r from-blue-600 to-slate-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                <Briefcase className="w-4 h-4" />
                                Recruiter
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2 mb-6 p-1 bg-slate-950/50 rounded-lg">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300 ${isLogin
                                ? 'bg-gradient-to-r from-blue-600 to-slate-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300 ${!isLogin
                                ? 'bg-gradient-to-r from-blue-600 to-slate-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            Create Account
                        </button>
                    </div>

                    {message.text && (
                        <div
                            className={`mb-4 p-4 rounded-lg border transition-all duration-500 ${showMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                                } ${message.type === 'error'
                                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {message.type === 'error' ? (
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                ) : (
                                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                )}
                                <span className="text-sm font-medium">
                                    {message.text}
                                </span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    <User className="w-4 h-4 inline mr-2" />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                <Mail className="w-4 h-4 inline mr-2" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder={userType === 'student' ? 'student@university.edu' : 'recruiter@company.com'}
                                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                <Lock className="w-4 h-4 inline mr-2" />
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                                required
                            />
                            {!isLogin && (
                                <p className="mt-2 text-xs text-slate-500">
                                    🔒 Use 8+ characters with a mix of letters, numbers, and symbols for a stronger vault key.
                                </p>
                            )}
                        </div>

                        {!isLogin && userType === 'student' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        <GraduationCap className="w-4 h-4 inline mr-2" />
                                        University
                                    </label>
                                    <input
                                        type="text"
                                        name="university"
                                        value={formData.university}
                                        onChange={handleInputChange}
                                        placeholder="e.g., MIT, Stanford"
                                        className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        <BookOpen className="w-4 h-4 inline mr-2" />
                                        Degree
                                    </label>
                                    <input
                                        type="text"
                                        name="degree"
                                        value={formData.degree}
                                        onChange={handleInputChange}
                                        placeholder="e.g., B.Tech, M.Sc"
                                        className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        <BookOpen className="w-4 h-4 inline mr-2" />
                                        Branch
                                    </label>
                                    <input
                                        type="text"
                                        name="branch"
                                        value={formData.branch}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Computer Science"
                                        className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        <Calendar className="w-4 h-4 inline mr-2" />
                                        Graduation Year
                                    </label>
                                    <input
                                        type="number"
                                        name="graduationYear"
                                        value={formData.graduationYear}
                                        onChange={handleInputChange}
                                        placeholder="2026"
                                        min="2020"
                                        max="2030"
                                        className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        {!isLogin && userType === 'recruiter' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        <Building2 className="w-4 h-4 inline mr-2" />
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Google, Microsoft"
                                        className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        <Mail className="w-4 h-4 inline mr-2" />
                                        Company Website (Optional)
                                    </label>
                                    <input
                                        type="url"
                                        name="companyWebsite"
                                        value={formData.companyWebsite}
                                        onChange={handleInputChange}
                                        placeholder="https://company.com"
                                        className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                                    />
                                </div>
                            </>
                        )}

                        {isLogin && (
                            <div className="text-right">
                                <button
                                    type="button"
                                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-300"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full mt-6 py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                            style={{
                                background: userType === 'student'
                                    ? 'linear-gradient(135deg, #38BDF8 0%, #2DD4BF 100%)'
                                    : 'linear-gradient(135deg, #3B82F6 0%, #475569 100%)'
                            }}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-pulse">•</span>
                                    <span className="animate-pulse">•</span>
                                    <span className="animate-pulse">•</span>
                                </span>
                            ) : (
                                isLogin
                                    ? (userType === 'student' ? 'Login to Vault' : 'Login to Scout')
                                    : 'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="my-6 border-t border-slate-700/50"></div>

                    <p className="text-center text-sm text-slate-500">
                        {isLogin ? (
                            <>
                                Don't have an account?{' '}
                                <button
                                    onClick={() => setIsLogin(false)}
                                    className="text-blue-400 hover:text-blue-300 transition-colors duration-300 font-medium"
                                >
                                    Sign up
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <button
                                    onClick={() => setIsLogin(true)}
                                    className="text-blue-400 hover:text-blue-300 transition-colors duration-300 font-medium"
                                >
                                    Login
                                </button>
                            </>
                        )}
                    </p>
                </div>

                <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-lg">
                        <Lock className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-slate-400 font-mono">
                            256-bit AES Encryption
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
