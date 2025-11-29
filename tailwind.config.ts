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
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Pikkrr Design System Colors from Figma
        'pikkrr-green': '#00C57E', // Emerald Green
        'pikkrr-dark': '#1A1A1A', // Dark Gray
        'pikkrr-mint': '#EFFFEE', // Light Mint
        'pikkrr-white': '#FFFFFF',
      },
      borderRadius: {
        'soft': '16px', // Soft corners for cards
        'soft-lg': '24px',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.08)', // Floating card shadow
        'card-lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};
export default config;

