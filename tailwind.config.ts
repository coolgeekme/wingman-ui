import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'zinc-950': '#09090b',
        'zinc-900': '#18181b',
        'zinc-800': '#27272a',
        'zinc-700': '#3f3f46',
        'zinc-600': '#52525b',
        'zinc-500': '#71717a',
        'zinc-400': '#a1a1aa',
        'zinc-300': '#d4d4d8',
        'zinc-200': '#e4e4e7',
        'zinc-100': '#f4f4f5',
        'zinc-50': '#fafafa',
        'wingman-teal': '#49d1d1',
        'wingman-blue': '#6366f1',
      },
      backgroundImage: {
        'dot-grid': 'radial-gradient(circle, #27272a 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-grid': '24px 24px',
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config
