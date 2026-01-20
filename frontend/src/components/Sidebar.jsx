import { Shield, LayoutDashboard, PlusCircle, Grid, Briefcase } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Sidebar() {
    const [username, setUsername] = useState(null)

    useEffect(() => {
        // Get username from localStorage
        const userDataString = localStorage.getItem('user')
        if (userDataString) {
            try {
                const userData = JSON.parse(userDataString)
                setUsername(userData.username)
            } catch (error) {
                console.error('Error parsing user data:', error)
            }
        }
    }, [])

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Security Deposit', icon: PlusCircle, path: '/deposit' },
        { name: 'The Vault', icon: Grid, path: '/vault' },
        ...(username ? [{ name: 'Portfolio', icon: Briefcase, path: `/portfolio/${username}` }] : [])
    ]

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-1 border-r border-border-subtle flex flex-col z-40">
            {/* EduVault Branding */}
            <div className="p-8 border-b border-border-subtle">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-vault bg-gradient-primary flex items-center justify-center" style={{
                        boxShadow: '0 0 24px rgba(56, 189, 248, 0.4), 0 0 48px rgba(45, 212, 191, 0.2)'
                    }}>
                        <Shield className="w-7 h-7 text-white" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-display font-bold tracking-tight" style={{
                        background: 'linear-gradient(135deg, #38BDF8 0%, #2DD4BF 50%, #818CF8 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textShadow: 'none',
                        fontFamily: 'Outfit, sans-serif',
                        letterSpacing: '-0.02em'
                    }}>
                        EduVault
                    </h1>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-6 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 rounded-vault transition-all duration-vault ${isActive
                                ? 'text-accent-teal shadow-vault'
                                : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                            }`
                        }
                        style={({ isActive }) => ({
                            backgroundColor: isActive ? 'rgba(45, 212, 191, 0.1)' : 'transparent'
                        })}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className="w-5 h-5" strokeWidth={2} />
                                <span className="font-medium">{item.name}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer Badge */}
            <div className="p-6 border-t border-border-subtle">
                <div className="px-4 py-2 bg-accent-cyan/5 border border-accent-cyan/20 rounded-vault-sm">
                    <p className="text-xs text-accent-cyan font-mono text-center">
                        🔒 Secured by AES-256
                    </p>
                </div>
            </div>
        </aside>
    )
}
