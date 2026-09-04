/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b0f19",
        card: "#111827",
        cardBorder: "#1f2937",
        primary: "#3b82f6",
        primaryHover: "#2563eb",
        accent: "#10b981",
        accentNegative: "#ef4444",
      },
    },
  },
  plugins: [],
};
