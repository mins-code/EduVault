/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // === VAULT NIGHT COLOR SYSTEM ===

        // Background Gradients
        'bg-top': '#0A0F1F',        // Deep bluish black
        'bg-middle': '#0B1220',     // Primary background
        'bg-bottom': '#020617',     // Almost black with blue undertone

        // Surface Colors (Panels, Sidebars, Modals)
        'surface-1': '#0F172A',     // Base surface
        'surface-2': '#111C33',     // Elevated surface

        // Card System
        'card-dark': '#020617',     // Card gradient start
        'card-light': '#0F172A',    // Card gradient end

        // Accent Colors (Use Sparingly)
        'accent-cyan': '#38BDF8',   // Primary accent - main actions
        'accent-teal': '#2DD4BF',   // Secondary accent - success, active
        'accent-violet': '#8B5CF6', // Tertiary accent - highlights

        // Text Hierarchy
        'text-primary': '#E5E7EB',  // Primary text
        'text-secondary': '#94A3B8', // Secondary text
        'text-muted': '#64748B',    // Muted labels
        'text-disabled': '#475569', // Disabled text

        // Border Colors
        'border-subtle': 'rgba(148, 163, 184, 0.08)',
        'border-default': 'rgba(148, 163, 184, 0.15)',
        'border-glow': 'rgba(56, 189, 248, 0.35)',
      },

      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
        'base': ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],
        '5xl': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        '6xl': ['3.75rem', { lineHeight: '1.2', letterSpacing: '-0.03em' }],
        '7xl': ['4.5rem', { lineHeight: '1.2', letterSpacing: '-0.03em' }],
        '8xl': ['6rem', { lineHeight: '1.2', letterSpacing: '-0.03em' }],
      },

      backgroundImage: {
        // Premium Gradients
        'gradient-vault': 'linear-gradient(180deg, #0A0F1F 0%, #0B1220 50%, #020617 100%)',
        'gradient-card': 'linear-gradient(145deg, #0F172A, #020617)',
        'gradient-primary': 'linear-gradient(135deg, #38BDF8, #2DD4BF)',
        'gradient-accent': 'linear-gradient(135deg, #2DD4BF, #8B5CF6)',
      },

      boxShadow: {
        // Soft, Diffused Shadows
        'vault-sm': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'vault': '0 4px 16px rgba(0, 0, 0, 0.4)',
        'vault-lg': '0 8px 32px rgba(0, 0, 0, 0.5)',
        'vault-glow': '0 0 24px rgba(56, 189, 248, 0.2)',
        'vault-glow-hover': '0 0 32px rgba(56, 189, 248, 0.35)',
      },

      borderRadius: {
        'vault': '12px',
        'vault-sm': '10px',
        'vault-lg': '16px',
      },

      backdropBlur: {
        'vault': '12px',
      },

      transitionDuration: {
        'vault': '250ms',
      },

      transitionTimingFunction: {
        'vault': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'vault-spring': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },

      keyframes: {
        'vault-lift': {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-4px)' },
        },
        'vault-press': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.98)' },
        },
        'vault-glow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'vault-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },

      animation: {
        'vault-lift': 'vault-lift 0.25s ease-out forwards',
        'vault-press': 'vault-press 0.15s ease-out forwards',
        'vault-glow': 'vault-glow 2s ease-in-out infinite',
        'vault-pulse': 'vault-pulse 0.6s ease-out',
      },
    },
  },
  plugins: [],
}

