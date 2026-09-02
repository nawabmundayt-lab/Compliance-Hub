import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#0A3B1E',
          green2: '#14522A',
          gold: '#F4B942',
          golddark: '#E0A82E',
          mint: '#C8E6D9',
          cream: '#FFF3CD',
        },
        surface: { page: '#EEF2EF', tint: '#E8F5E9', input: '#F9FDF9' },
        status: {
          valid: '#0D6B5E',
          upcoming: '#2155A3',
          near: '#B45309',
          nearbg: '#FFF3CD',
          critical: '#D97706',
          expired: '#BC3A3A',
          expireddeep: '#8B2727',
          missing: '#6B7280',
        },
      },
      fontFamily: {
        ui: ['Segoe UI', 'Inter', 'Arial', 'sans-serif'],
        display: ['"Arial Black"', 'Arial', 'sans-serif'],
        print: ['"Times New Roman"', 'Times', 'serif'],
      },
      borderRadius: { pill: '40px' },
      boxShadow: {
        card: '0 12px 28px rgba(0,0,0,0.20)',
        light: '0 3px 10px rgba(0,0,0,0.08)',
        bar: '0 6px 14px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
};
export default config;
