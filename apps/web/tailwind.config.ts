import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      colors: {
        canvas: 'hsl(var(--canvas))',
        panel: 'hsl(var(--panel))',
        ink: 'hsl(var(--ink))',
        muted: 'hsl(var(--muted))',
        accent: 'hsl(var(--accent))',
      },
      boxShadow: {
        glow: '0 0 40px hsl(var(--accent) / 0.2)',
      },
    },
  },
  plugins: [],
};

export default config;
