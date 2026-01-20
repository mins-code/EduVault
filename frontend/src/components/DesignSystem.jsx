import React from 'react'

export default function DesignSystem() {
    return (
        <div className="min-h-screen p-8 space-y-12">

            {/* Header */}
            <header className="text-center space-y-4 pb-8">
                <h1 className="text-6xl font-heading font-bold text-gradient-primary">
                    Vault Night Design System
                </h1>
                <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                    Premium dark theme for EduVault — Secure, Academic, Futuristic
                </p>
            </header>

            <div className="vault-divider"></div>

            {/* Color Palette */}
            <section className="space-y-6">
                <h2 className="text-3xl font-heading text-text-primary">Color System</h2>

                {/* Background Gradients */}
                <div className="surface-panel space-y-4">
                    <h3 className="text-xl font-heading text-text-secondary">Background Gradients</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <div className="h-24 rounded-vault" style={{ background: '#0A0F1F' }}></div>
                            <p className="text-sm text-text-muted font-mono">bg-top: #0A0F1F</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-24 rounded-vault" style={{ background: '#0B1220' }}></div>
                            <p className="text-sm text-text-muted font-mono">bg-middle: #0B1220</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-24 rounded-vault" style={{ background: '#020617' }}></div>
                            <p className="text-sm text-text-muted font-mono">bg-bottom: #020617</p>
                        </div>
                    </div>
                </div>

                {/* Accent Colors */}
                <div className="surface-panel space-y-4">
                    <h3 className="text-xl font-heading text-text-secondary">Accent Colors (Use Sparingly)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <div className="h-24 bg-accent-cyan rounded-vault glow-cyan"></div>
                            <p className="text-sm text-text-muted font-mono">accent-cyan: #38BDF8</p>
                            <p className="text-xs text-text-disabled">Primary accent - main actions</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-24 bg-accent-teal rounded-vault glow-teal"></div>
                            <p className="text-sm text-text-muted font-mono">accent-teal: #2DD4BF</p>
                            <p className="text-xs text-text-disabled">Secondary - success, active</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-24 bg-accent-violet rounded-vault glow-violet"></div>
                            <p className="text-sm text-text-muted font-mono">accent-violet: #8B5CF6</p>
                            <p className="text-xs text-text-disabled">Tertiary - highlights</p>
                        </div>
                    </div>
                </div>

                {/* Text Hierarchy */}
                <div className="surface-panel space-y-4">
                    <h3 className="text-xl font-heading text-text-secondary">Text Hierarchy</h3>
                    <div className="space-y-3">
                        <p className="text-text-primary text-lg">Primary text: #E5E7EB</p>
                        <p className="text-text-secondary text-lg">Secondary text: #94A3B8</p>
                        <p className="text-text-muted text-lg">Muted labels: #64748B</p>
                        <p className="text-text-disabled text-lg">Disabled text: #475569</p>
                    </div>
                </div>
            </section>

            <div className="vault-divider"></div>

            {/* Typography */}
            <section className="space-y-6">
                <h2 className="text-3xl font-heading text-text-primary">Typography</h2>

                <div className="surface-panel space-y-6">
                    {/* Headings */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-heading text-text-secondary">Headings - Space Grotesk</h3>
                        <h1 className="text-6xl font-heading">Heading 1</h1>
                        <h2 className="text-5xl font-heading">Heading 2</h2>
                        <h3 className="text-4xl font-heading">Heading 3</h3>
                        <h4 className="text-3xl font-heading">Heading 4</h4>
                    </div>

                    {/* Body Text */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-heading text-text-secondary">Body Text - Inter</h3>
                        <p className="text-lg font-body text-text-primary">
                            Large body text for important descriptions and introductions.
                        </p>
                        <p className="text-base font-body text-text-secondary">
                            Regular body text for general content and paragraphs with good readability.
                        </p>
                        <p className="text-sm font-body text-text-muted">
                            Small text for labels, captions, and secondary information.
                        </p>
                    </div>

                    {/* Monospace */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-heading text-text-secondary">Numbers & Stats - JetBrains Mono</h3>
                        <p className="text-2xl font-mono text-accent-cyan">1,234,567</p>
                        <p className="text-lg font-mono text-text-primary">2026-01-20 13:35:00</p>
                        <p className="text-base font-mono text-text-secondary">42.5 MB</p>
                    </div>
                </div>
            </section>

            <div className="vault-divider"></div>

            {/* Buttons */}
            <section className="space-y-6">
                <h2 className="text-3xl font-heading text-text-primary">Button System</h2>

                <div className="surface-panel space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-xl font-heading text-text-secondary">Primary Button</h3>
                        <div className="flex flex-wrap gap-4">
                            <button className="btn-primary">Upload Document</button>
                            <button className="btn-primary">Save Changes</button>
                            <button className="btn-primary">Create Vault</button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-heading text-text-secondary">Secondary Button</h3>
                        <div className="flex flex-wrap gap-4">
                            <button className="btn-secondary">Cancel</button>
                            <button className="btn-secondary">Learn More</button>
                            <button className="btn-secondary">View Details</button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="vault-divider"></div>

            {/* Inputs & Forms */}
            <section className="space-y-6">
                <h2 className="text-3xl font-heading text-text-primary">Inputs & Forms</h2>

                <div className="surface-panel space-y-6">
                    <div className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="student@university.edu"
                                className="vault-input w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                className="vault-input w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Document Name
                            </label>
                            <input
                                type="text"
                                placeholder="Transcript_2024.pdf"
                                className="vault-input w-full"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <div className="vault-divider"></div>

            {/* Cards */}
            <section className="space-y-6">
                <h2 className="text-3xl font-heading text-text-primary">Card Components</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Vault Card */}
                    <div className="vault-card p-6 space-y-4">
                        <h3 className="text-xl font-heading text-text-primary">Vault Card</h3>
                        <p className="text-text-secondary">
                            Sealed like a vault drawer with hover glow effect.
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="vault-badge">Active</span>
                            <span className="text-sm text-text-muted font-mono">12 files</span>
                        </div>
                    </div>

                    {/* Glass Panel */}
                    <div className="glass-panel p-6 space-y-4">
                        <h3 className="text-xl font-heading text-text-primary">Glass Panel</h3>
                        <p className="text-text-secondary">
                            Frosted glass effect with backdrop blur.
                        </p>
                        <span className="vault-badge-success">Verified</span>
                    </div>

                    {/* Surface Panel */}
                    <div className="surface-elevated space-y-4">
                        <h3 className="text-xl font-heading text-text-primary">Elevated Surface</h3>
                        <p className="text-text-secondary">
                            Higher elevation with enhanced shadow.
                        </p>
                        <span className="vault-badge-highlight">Premium</span>
                    </div>
                </div>
            </section>

            <div className="vault-divider"></div>

            {/* Badges */}
            <section className="space-y-6">
                <h2 className="text-3xl font-heading text-text-primary">Badges & Labels</h2>

                <div className="surface-panel">
                    <div className="flex flex-wrap gap-3">
                        <span className="vault-badge">Default</span>
                        <span className="vault-badge-success">Success</span>
                        <span className="vault-badge-highlight">Highlight</span>
                        <span className="vault-badge">Active</span>
                        <span className="vault-badge-success">Verified</span>
                        <span className="vault-badge-highlight">Premium</span>
                    </div>
                </div>
            </section>

            <div className="vault-divider"></div>

            {/* Icons & Micro-interactions */}
            <section className="space-y-6">
                <h2 className="text-3xl font-heading text-text-primary">Icons & Interactions</h2>

                <div className="surface-panel space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-xl font-heading text-text-secondary">Icon Hover Effect</h3>
                        <div className="flex gap-6">
                            <svg className="vault-icon w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <svg className="vault-icon w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <svg className="vault-icon w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-heading text-text-secondary">Loading Animation</h3>
                        <div className="flex gap-2">
                            <div className="loading-dot w-3 h-3 bg-accent-cyan rounded-full"></div>
                            <div className="loading-dot w-3 h-3 bg-accent-cyan rounded-full"></div>
                            <div className="loading-dot w-3 h-3 bg-accent-cyan rounded-full"></div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="vault-divider"></div>

            {/* Gradients */}
            <section className="space-y-6">
                <h2 className="text-3xl font-heading text-text-primary">Gradient System</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="surface-panel space-y-4">
                        <h3 className="text-xl font-heading text-text-secondary">Primary Gradient</h3>
                        <div className="h-32 bg-gradient-primary rounded-vault"></div>
                        <p className="text-sm text-text-muted font-mono">Cyan → Teal</p>
                    </div>

                    <div className="surface-panel space-y-4">
                        <h3 className="text-xl font-heading text-text-secondary">Accent Gradient</h3>
                        <div className="h-32 bg-gradient-accent rounded-vault"></div>
                        <p className="text-sm text-text-muted font-mono">Teal → Violet</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="text-center pt-12 pb-8">
                <p className="text-text-muted">
                    Vault Night Design System — Trust, Focus, Intelligence, Privacy
                </p>
            </footer>

        </div>
    )
}
