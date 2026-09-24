import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FBF9F5',
          100: '#F5F0E6',
          200: '#EBDDC7',
          300: '#DEC5A3',
          400: '#CFA87D',
          500: '#C5A880', // Signature gold
          600: '#A98758',
          700: '#8A693C',
          800: '#6C5029',
          900: '#4D3617',
        },
        sand: {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F4EFEA',
          300: '#EAE2D8',
          400: '#D5C8B8',
          500: '#B8A590',
        },
        charcoal: {
          800: '#1E242B',
          850: '#181E24',
          900: '#12161A',
          950: '#0B0E11',
        },
        emerald: {
          900: '#14271F',
          950: '#0C1B14',
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-outfit)", "Inter", "sans-serif"],
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 1px 1px rgba(0, 0, 0, 0.04)',
        'luxury-lg': '0 30px 60px -20px rgba(0, 0, 0, 0.15), 0 0 1px 1px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};

export default config;
