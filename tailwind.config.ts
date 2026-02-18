import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Système primaire Applipro
        applipro: {
          dark: "#0E0E52",
          DEFAULT: "#3374FF",
          "05": "#ECEEFE",
          "20": "#D0DDFF",
        },
        // Boutons primaires (design system bouton)
        primary: {
          DEFAULT: "#4C76FF",
          hover: "#3A5CD6",
        },
        // Système neutre
        noir: "#121624",
        gris: {
          80: "#404350",
          60: "#6E707C",
          40: "#9B9DA7",
          20: "#C9CAD3",
          10: "#E0E1E9",
          "05": "#ECECF4",
        },
        blanc: "#F7F7FF",
        // Système statut
        statut: {
          vert: "#00A878",
          "vert-20": "#CCEEE4",
          orange: "#DC7224",
          "orange-20": "#F8E3D3",
          rouge: "#CC2936",
          "rouge-20": "#F1C3C7",
        },
        // Secondary button & disabled
        secondary: {
          bg: "#E5E7EB",
          text: "#4B5563",
          hover: "#4B5563",
        },
        disabled: {
          bg: "#E5E7EB",
          text: "#9CA3AF",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        applipro: "6px",
      },
    },
  },
  plugins: [],
};

export default config;
