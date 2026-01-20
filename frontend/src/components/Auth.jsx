import { useState } from 'react'
import { Shield, Lock, Mail, User, GraduationCap, BookOpen, Calendar, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../api'

export default function Auth() {
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
        graduationYear: ''
    })

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        // Clear message when user starts typing
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
            if (isLogin) {
                // Login logic
                const response = await api.post('/api/auth/login', {
                    email: formData.email,
                    password: formData.password
                })

                if (response.data.success) {
                    // Store token in localStorage
                    localStorage.setItem('token', response.data.token)
                    localStorage.setItem('user', JSON.stringify(response.data.user))

                    setMessage({
                        type: 'success',
                        text: 'Login successful! Redirecting to Dashboard...'
                    })
                    setShowMessage(true)

                    // Redirect to dashboard after brief delay
                    setTimeout(() => {
                        window.location.href = '/dashboard'
                    }, 1500)
                }
            } else {
                // Registration logic
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
                        text: response.data.message // 'Vault Created Successfully'
                    })
                    setShowMessage(true)

                    // Clear form
                    setFormData({
                        fullName: '',
                        email: '',
                        password: '',
                        university: '',
                        degree: '',
                        branch: '',
                        graduationYear: ''
                    })

                    // Redirect to login after 2 seconds
                    setTimeout(() => {
                        setIsLogin(true)
                        setShowMessage(false)
                        setTimeout(() => setMessage({ type: '', text: '' }), 300)
                    }, 2000)
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
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
            {/* Vault Card Container */}
            <div className="w-full max-w-md">

                {/* EduVault Logo/Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-primary mb-4" style={{
                        boxShadow: '0 0 32px rgba(56, 189, 248, 0.5), 0 0 64px rgba(45, 212, 191, 0.3)'
                    }}>
                        <Shield className="w-10 h-10 text-white" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-5xl font-bold mb-2" style={{
                        background: 'linear-gradient(135deg, #38BDF8 0%, #2DD4BF 50%, #818CF8 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontFamily: 'Outfit, sans-serif',
                        letterSpacing: '-0.02em'
                    }}>
                        EduVault
                    </h1>
                    <p className="text-text-secondary" style={{
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        Your Secure Digital Locker
                    </p>
                </div>

                {/* Vault Card */}
                <div className="bg-gradient-card border border-border-subtle rounded-vault-lg shadow-vault-lg p-8">

                    {/* Toggle Tabs */}
                    <div className="flex gap-2 mb-6 p-1 bg-bg-bottom rounded-vault">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 px-4 rounded-vault-sm font-medium transition-all duration-vault ${isLogin
                                ? 'bg-gradient-primary text-bg-bottom shadow-vault'
                                : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 px-4 rounded-vault-sm font-medium transition-all duration-vault ${!isLogin
                                ? 'bg-gradient-primary text-bg-bottom shadow-vault'
                                : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Error/Success Message Alert */}
                    {message.text && (
                        <div
                            className={`mb-4 p-4 rounded-vault border transition-all duration-500 ${showMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                                } ${message.type === 'error'
                                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                    : 'bg-accent-teal/10 border-accent-teal/30 text-accent-teal'
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

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Full Name - Only for Signup */}
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    <User className="w-4 h-4 inline mr-2" />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="John Doe"
                                    className="vault-input w-full"
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                <Mail className="w-4 h-4 inline mr-2" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="student@university.edu"
                                className="vault-input w-full"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                <Lock className="w-4 h-4 inline mr-2" />
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                                className="vault-input w-full"
                                required
                            />
                            {/* Password Reminder - Only for Signup */}
                            {!isLogin && (
                                <p className="mt-2 text-xs" style={{ color: '#64748B' }}>
                                    🔒 Use 8+ characters with a mix of letters, numbers, and symbols for a stronger vault key.
                                </p>
                            )}
                        </div>

                        {/* Signup-only fields */}
                        {!isLogin && (
                            <>
                                {/* University */}
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">
                                        <GraduationCap className="w-4 h-4 inline mr-2" />
                                        University
                                    </label>
                                    <input
                                        type="text"
                                        name="university"
                                        value={formData.university}
                                        onChange={handleInputChange}
                                        placeholder="e.g., MIT, Stanford"
                                        className="vault-input w-full"
                                        required={!isLogin}
                                    />
                                </div>

                                {/* Degree */}
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">
                                        <BookOpen className="w-4 h-4 inline mr-2" />
                                        Degree
                                    </label>
                                    <input
                                        type="text"
                                        name="degree"
                                        value={formData.degree}
                                        onChange={handleInputChange}
                                        placeholder="e.g., B.Tech, M.Sc"
                                        className="vault-input w-full"
                                        required={!isLogin}
                                    />
                                </div>

                                {/* Branch */}
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">
                                        <BookOpen className="w-4 h-4 inline mr-2" />
                                        Branch
                                    </label>
                                    <input
                                        type="text"
                                        name="branch"
                                        value={formData.branch}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Computer Science"
                                        className="vault-input w-full"
                                        required={!isLogin}
                                    />
                                </div>

                                {/* Graduation Year */}
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">
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
                                        className="vault-input w-full"
                                        required={!isLogin}
                                    />
                                </div>
                            </>
                        )}

                        {/* Forgot Password - Only for Login */}
                        {isLogin && (
                            <div className="text-right">
                                <button
                                    type="button"
                                    className="text-sm text-accent-cyan hover:text-accent-teal transition-colors duration-vault"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="btn-primary w-full mt-6"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="loading-dot">•</span>
                                    <span className="loading-dot">•</span>
                                    <span className="loading-dot">•</span>
                                </span>
                            ) : (
                                isLogin ? 'Login to Vault' : 'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="vault-divider my-6"></div>

                    {/* Additional Info */}
                    <p className="text-center text-sm text-text-muted">
                        {isLogin ? (
                            <>
                                Don't have an account?{' '}
                                <button
                                    onClick={() => setIsLogin(false)}
                                    className="text-accent-cyan hover:text-accent-teal transition-colors duration-vault font-medium"
                                >
                                    Sign up
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <button
                                    onClick={() => setIsLogin(true)}
                                    className="text-accent-cyan hover:text-accent-teal transition-colors duration-vault font-medium"
                                >
                                    Login
                                </button>
                            </>
                        )}
                    </p>
                </div>

                {/* Security Badge */}
                <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-1/50 backdrop-blur-vault border border-border-subtle rounded-vault-sm">
                        <Lock className="w-4 h-4 text-accent-teal" />
                        <span className="text-xs text-text-secondary font-mono">
                            256-bit AES Encryption
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
