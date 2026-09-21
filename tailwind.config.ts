import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        background: 'oklch(var(--background) / <alpha-value>)',
        foreground: 'oklch(var(--foreground) / <alpha-value>)',
        card: 'oklch(var(--card) / <alpha-value>)',
        'card-foreground': 'oklch(var(--card-foreground) / <alpha-value>)',
        popover: 'oklch(var(--popover) / <alpha-value>)',
        'popover-foreground': 'oklch(var(--popover-foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
          foreground: 'oklch(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
          foreground: 'oklch(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
          foreground: 'oklch(var(--muted-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
          foreground: 'oklch(var(--destructive-foreground) / <alpha-value>)',
        },
        border: 'oklch(var(--border) / <alpha-value>)',
        input: 'oklch(var(--input) / <alpha-value>)',
        ring: 'oklch(var(--ring) / <alpha-value>)',
        surface: {
          DEFAULT: 'oklch(var(--surface-950) / <alpha-value>)',
          50: 'oklch(var(--surface-50) / <alpha-value>)',
          100: 'oklch(var(--surface-100) / <alpha-value>)',
          200: 'oklch(var(--surface-200) / <alpha-value>)',
          300: 'oklch(var(--surface-300) / <alpha-value>)',
          400: 'oklch(var(--surface-400) / <alpha-value>)',
          500: 'oklch(var(--surface-500) / <alpha-value>)',
          600: 'oklch(var(--surface-600) / <alpha-value>)',
          700: 'oklch(var(--surface-700) / <alpha-value>)',
          800: 'oklch(var(--surface-800) / <alpha-value>)',
          900: 'oklch(var(--surface-900) / <alpha-value>)',
          950: 'oklch(var(--surface-950) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'oklch(var(--accent-500) / <alpha-value>)',
          text: 'oklch(var(--color-accent-text) / <alpha-value>)',
          'text-strong': 'oklch(var(--color-accent-text-strong) / <alpha-value>)',
          50: 'oklch(var(--accent-50) / <alpha-value>)',
          100: 'oklch(var(--accent-100) / <alpha-value>)',
          200: 'oklch(var(--accent-200) / <alpha-value>)',
          300: 'oklch(var(--accent-300) / <alpha-value>)',
          400: 'oklch(var(--accent-400) / <alpha-value>)',
          500: 'oklch(var(--accent-500) / <alpha-value>)',
          600: 'oklch(var(--accent-600) / <alpha-value>)',
          700: 'oklch(var(--accent-700) / <alpha-value>)',
          800: 'oklch(var(--accent-800) / <alpha-value>)',
          900: 'oklch(var(--accent-900) / <alpha-value>)',
        },
        chart: {
          1: 'oklch(var(--chart-1) / <alpha-value>)',
          2: 'oklch(var(--chart-2) / <alpha-value>)',
          3: 'oklch(var(--chart-3) / <alpha-value>)',
          4: 'oklch(var(--chart-4) / <alpha-value>)',
          5: 'oklch(var(--chart-5) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['"Geist Variable"', 'Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"IBM Plex Mono"', '"Instrument Sans Variable"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        mono: ['"IBM Plex Mono"', '"Geist Mono Variable"', '"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-xl)',
      },
      animation: {
        'fade-in': 'fadeIn 280ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 380ms cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 260ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
