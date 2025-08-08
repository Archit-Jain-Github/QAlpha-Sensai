/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      screens: {
        'xxs': '375px',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "gradient-fade": {
          "0%": { opacity: 0 },
          "20%": { opacity: 0.6 },
          "80%": { opacity: 0.6 },
          "100%": { opacity: 0 }
        },
        "celebration-reveal": {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "20%": { opacity: 1, transform: "translateY(0)" },
          "80%": { opacity: 1, transform: "translateY(0)" },
          "100%": { opacity: 0, transform: "translateY(-20px)" }
        },
        "gradient-x": {
          "0%, 100%": { 
            backgroundPosition: "0% 50%",
            backgroundSize: "200% 200%"
          },
          "50%": { 
            backgroundPosition: "100% 50%",
            backgroundSize: "200% 200%"
          }
        },
        "loadingBar": {
          "0%": { width: "0%" },
          "20%": { width: "20%" },
          "40%": { width: "45%" },
          "60%": { width: "65%" },
          "80%": { width: "85%" },
          "100%": { width: "100%" }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gradient-fade": "gradient-fade 3.5s ease-in-out forwards",
        "celebration-reveal": "celebration-reveal 3.5s ease-in-out forwards",
        "gradient-x": "gradient-x 3s ease infinite",
        "loadingBar": "loadingBar 4s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "question-highlight": "3s ease-in-out forwards"
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar")],
} 