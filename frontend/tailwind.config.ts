import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Raw palette, available directly as e.g. bg-hunter-green-600
        'hunter-green': {
          DEFAULT: '#386641',
          100: '#0b140d',
          200: '#16291a',
          300: '#223d27',
          400: '#2d5234',
          500: '#386641',
          600: '#51935e',
          700: '#77b483',
          800: '#a4cdac',
          900: '#d2e6d6',
        },
        'sage-green': {
          DEFAULT: '#6a994e',
          100: '#151e10',
          200: '#2a3d1f',
          300: '#3f5b2f',
          400: '#54793e',
          500: '#6a994e',
          600: '#85b36b',
          700: '#a4c690',
          800: '#c2d9b5',
          900: '#e1ecda',
        },
        'yellow-green': {
          DEFAULT: '#a7c957',
          100: '#222b0e',
          200: '#45561c',
          300: '#67812a',
          400: '#8aad38',
          500: '#a7c957',
          600: '#b8d377',
          700: '#c9de99',
          800: '#dbe9bb',
          900: '#edf4dd',
        },
        'vanilla-cream': {
          DEFAULT: '#f2e8cf',
          100: '#463813',
          200: '#8d7027',
          300: '#cba442',
          400: '#dfc688',
          500: '#f2e8cf',
          600: '#f4edd9',
          700: '#f7f1e2',
          800: '#faf6ec',
          900: '#fcfaf5',
        },
        'blushed-brick': {
          DEFAULT: '#bc4749',
          100: '#260e0e',
          200: '#4c1c1c',
          300: '#73292b',
          400: '#993739',
          500: '#bc4749',
          600: '#ca6c6e',
          700: '#d79192',
          800: '#e5b6b6',
          900: '#f2dadb',
        },

        // shadcn semantic tokens, backed by the palette above via CSS variables
        border: 'rgb(var(--border) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
          foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'rgb(var(--popover) / <alpha-value>)',
          foreground: 'rgb(var(--popover-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
        sidebar: {
          DEFAULT: 'rgb(var(--sidebar-background) / <alpha-value>)',
          foreground: 'rgb(var(--sidebar-foreground) / <alpha-value>)',
          primary: 'rgb(var(--sidebar-primary) / <alpha-value>)',
          'primary-foreground':
            'rgb(var(--sidebar-primary-foreground) / <alpha-value>)',
          accent: 'rgb(var(--sidebar-accent) / <alpha-value>)',
          'accent-foreground':
            'rgb(var(--sidebar-accent-foreground) / <alpha-value>)',
          border: 'rgb(var(--sidebar-border) / <alpha-value>)',
          ring: 'rgb(var(--sidebar-ring) / <alpha-value>)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
