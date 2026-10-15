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
        'accent-dim': 'var(--accent-dim)',
        warn: 'var(--warn)',
        danger: 'var(--danger)',
        info: 'var(--info)',
        background: 'var(--bg)',
        foreground: 'var(--text)',
        input: 'var(--border)',
        ring: 'var(--accent)',
        accent: { DEFAULT: 'var(--accent)', foreground: 'var(--bg)' },
        primary: { DEFAULT: 'var(--accent)', foreground: 'var(--bg)' },
        secondary: { DEFAULT: 'var(--bg-raised)', foreground: 'var(--text)' },
        destructive: { DEFAULT: 'var(--danger)', foreground: 'var(--text)' },
        muted: { DEFAULT: 'var(--bg-raised)', foreground: 'var(--text-muted)' },
        popover: { DEFAULT: 'var(--bg-raised)', foreground: 'var(--text)' },
        card: { DEFAULT: 'var(--bg-raised)', foreground: 'var(--text)' },

      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'sans-serif'],
        display: ['"Outfit"', 'ui-sans-serif', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        lg: '10px',
        md: '8px',
        sm: '6px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
