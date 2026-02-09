/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        highlight: "#E4FF30",
        gray: {
          50: "#f9fafb",
          100: "#f2f4f6",
          200: "#e5e8eb",
          300: "#d1d5db",
          400: "#b0b8c1",
          500: "#8b95a1",
          600: "#6b7684",
          700: "#4e5968",
          800: "#333d4b",
          900: "#191f28",
        },
      },
      fontFamily: {
        sans: ["Pretendard", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.04)",
        "card-hover": "0 4px 12px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
}

