/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          950: '#070b14',
          900: '#0b1120',
          850: '#0f172a',
          800: '#17223b',
          700: '#1e2e4f',
          600: '#2b3f6c',
          blue: '#0284c7',
          cyan: '#06b6d4',
          accent: '#38bdf8'
        },
        risk: {
          low: '#10b981',       // Safe / Low
          caution: '#f59e0b',   // Caution / Moderate
          suspicious: '#f97316',// Elevated / Suspicious
          critical: '#ef4444',  // High Risk / Severe
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.15)',
        'glow-red': '0 0 25px -5px rgba(239, 68, 68, 0.2)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.2)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.2)',
      }
    },
  },
  plugins: [],
}
