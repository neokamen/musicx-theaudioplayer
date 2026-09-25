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
          base: "var(--app-bg, #08090a)",          // Fondo principal dinámico
          surface: "var(--app-surface, #0f1115)",   // Paneles y tarjetas de reproducción
          surface2: "var(--app-surface2, #181b21)", // Superficie secundaria / hover
          border: "var(--app-border, #242831)",     // Bordes dinámicos
          muted: "#6b7280",                         // Textos secundarios
          text: "#e4e7eb",                          // Texto principal
          cyan: "var(--app-accent, #00f0ff)",       // Indicador de acento dinámico
          amber: "#e5a93c",                         // Vúmetro cálido
          green: "#10b981",                         // Estado Bit-perfect
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      animation: {
        marquee: "marquee 15s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
}
