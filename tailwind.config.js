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
          950: '#F8FAFC', // warm off-white page background
          900: '#FFFFFF', // pure white card surface
          850: '#F1F5F9', // light slate surface / pill
          800: '#E2E8F0', // slate-200 border
          700: '#CBD5E1', // slate-300 border
          600: '#94A3B8', // muted slate
          blue: '#2563EB',
          cyan: '#0EA5E9',
          accent: '#38BDF8'
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
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        'elevated': '0 4px 12px 0 rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
