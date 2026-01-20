import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function TopBar() {
    const navigate = useNavigate()
    const [userName, setUserName] = useState('User')

    useEffect(() => {
        // Get user data from localStorage
        const userDataString = localStorage.getItem('user')
        if (userDataString) {
            try {
                const userData = JSON.parse(userDataString)
                setUserName(userData.fullName || 'User')
            } catch (error) {
                console.error('Error parsing user data:', error)
            }
        }
    }, [])

    const handleLogout = () => {
        // Clear localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        // Force page reload to reset authentication state
        window.location.href = '/'
    }

    return (
        <header
            className="fixed top-0 left-64 right-0 h-20 z-30 border-b border-border-subtle"
            style={{
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
            }}
        >
            <div className="h-full px-8 flex items-center justify-between">
                {/* Welcome Message */}
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-text-primary" style={{
                        fontFamily: 'Outfit, sans-serif'
                    }}>
                        Welcome back, <span style={{
                            background: 'linear-gradient(135deg, #38BDF8 0%, #2DD4BF 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>{userName}</span>
                    </h2>
                    <p className="text-sm text-text-secondary mt-1" style={{
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        Your secure digital vault awaits
                    </p>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="btn-secondary flex items-center gap-2"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                </button>
            </div>
        </header>
    )
}
