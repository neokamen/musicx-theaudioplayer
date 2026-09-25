/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        audiophile: {
          base: "var(--app-bg, #08090a)",
          surface: "var(--app-surface, #0f1115)",
          surface2: "var(--app-surface2, #181b21)",
          border: "var(--app-border, #242831)",
          muted: "#8b949e",
          text: "var(--app-text, #e4e7eb)",
          cyan: "var(--app-accent, #06b6d4)",
          amber: "#e5a93c",
          green: "#10b981",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
}
