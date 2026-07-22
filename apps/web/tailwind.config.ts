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
        'panel-strong': 'hsl(var(--panel-strong))',
        'panel-hover': 'hsl(var(--panel-hover))',
        sidebar: 'hsl(var(--sidebar))',
        ink: 'hsl(var(--ink))',
        muted: 'hsl(var(--muted))',
        accent: 'hsl(var(--accent))',
        line: 'hsl(var(--line))',
      },
      boxShadow: {
        glow: '0 0 40px hsl(var(--accent) / 0.2)',
        panel: '0 20px 65px hsl(230 40% 3% / 0.18)',
      },
    },
  },
  plugins: [],
};

export default config;
