/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-raised': 'var(--bg-raised)',
        'bg-sunken': 'var(--bg-sunken)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        'text-faint': 'var(--text-faint)',
        accent: 'var(--accent)',
        'accent-dim': 'var(--accent-dim)',
        ice: 'var(--ice)',
        steel: 'var(--steel)',
        warn: 'var(--warn)',
        danger: 'var(--danger)',
        success: 'var(--success)',
        background: 'var(--bg)',
        foreground: 'var(--text)',
        input: 'var(--border)',
        ring: 'var(--accent)',
        primary: { DEFAULT: 'var(--accent)', foreground: 'var(--accent-fg)' },
        secondary: { DEFAULT: 'var(--bg-raised)', foreground: 'var(--text)' },
        destructive: { DEFAULT: 'var(--danger)', foreground: 'var(--accent-fg)' },
        muted: { DEFAULT: 'var(--bg-raised)', foreground: 'var(--text-muted)' },
        popover: { DEFAULT: 'var(--bg-raised)', foreground: 'var(--text)' },
        card: { DEFAULT: 'var(--bg-raised)', foreground: 'var(--text)' },
      },
      fontFamily: {
        sans: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Familjen Grotesk"', 'Sora', 'ui-sans-serif', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        lg: '10px',
        md: '8px',
        sm: '6px',
      },
      boxShadow: {
        soft: '0 12px 40px color-mix(in srgb, var(--text) 8%, transparent)',
        frost: '0 18px 50px color-mix(in srgb, var(--steel) 14%, transparent)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.55s ease-out both',
        'fade-in': 'fade-in 0.4s ease-out both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
