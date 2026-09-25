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
          base: "#08090a",      // Fondo ultra oscuro / OLED
          surface: "#0f1115",   // Paneles y tarjetas de reproducción
          surface2: "#181b21",  // Superficie secundaria / hover
          border: "#242831",    // Bordes sutiles de alta fidelidad
          muted: "#6b7280",     // Textos secundarios y metadatos tenue
          text: "#e4e7eb",      // Texto principal
          cyan: "#00f0ff",      // Indicador digital Hi-Res
          amber: "#e5a93c",     // Vúmetro cálido / lámpara de vacío vintage
          green: "#10b981",     // Estado de playback / Bit-perfect
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
