/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        border: "hsl(var(--border))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: "hsl(var(--accent))",
        brand: {
          50: "hsl(48 100% 97%)",
          100: "hsl(47 100% 92%)",
          500: "hsl(42 100% 50%)",
          600: "hsl(40 96% 40%)",
          900: "hsl(28 60% 12%)",
        },
        legacy: {
          500: "hsl(222 89% 55%)",
        },
      },
    },
  },
  plugins: [],
};
