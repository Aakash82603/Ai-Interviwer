export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: '#0b1326',
        surface: {
          1: '#131b2e',
          2: '#171f33',
          3: '#2d3449',
        },
        primary: '#4d8eff',
        error: '#ef4444',
        success: '#22C55E',
        onSurface: '#dae2fd',
        onSurfaceVariant: '#c2c6d6',
        outline: '#8c909f',
        outlineVariant: '#424754',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.5rem", // 8px for buttons
        xl: "0.75rem", // 12px for cards
        "2xl": "1rem",
        full: "9999px"
      }
    },
  },
  plugins: [],
}
