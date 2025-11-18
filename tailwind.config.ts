import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "0",
        sm: "0",
        md: "0",
        lg: "0",
        xl: "0",
        "2xl": "0",
      },
      screens: {
        xs: "475px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1400px",
        "2xl": "1800px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '-0.006em' }],
        'sm': ['0.875rem', { lineHeight: '1.5714', letterSpacing: '-0.008em' }],
        'base': ['1rem', { lineHeight: '1.75', letterSpacing: '-0.011em' }],
        'lg': ['1.125rem', { lineHeight: '1.7', letterSpacing: '-0.013em' }],
        'xl': ['1.25rem', { lineHeight: '1.6', letterSpacing: '-0.014em' }],
        '2xl': ['1.5rem', { lineHeight: '1.4167', letterSpacing: '-0.017em' }],
        '3xl': ['1.875rem', { lineHeight: '1.2667', letterSpacing: '-0.019em' }],
        '4xl': ['2.25rem', { lineHeight: '1.2222', letterSpacing: '-0.022em' }],
        '5xl': ['3rem', { lineHeight: '1.1667', letterSpacing: '-0.025em' }],
        '6xl': ['3.75rem', { lineHeight: '1.1333', letterSpacing: '-0.028em' }],
        '7xl': ['4.5rem', { lineHeight: '1.1111', letterSpacing: '-0.031em' }],
        '8xl': ['6rem', { lineHeight: '1.0833', letterSpacing: '-0.034em' }],
        '9xl': ['8rem', { lineHeight: '1.0625', letterSpacing: '-0.037em' }],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        normal: '-0.011em',
        wide: '0.01em',
        wider: '0.02em',
        widest: '0.04em',
      },
      lineHeight: {
        'none': '1',
        'tight': '1.2',
        'snug': '1.375',
        'normal': '1.6',
        'relaxed': '1.75',
        'loose': '2',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    function({ addVariant, addUtilities }: any) {
      addVariant('touch', '@media (hover: none) and (pointer: coarse)');
      addUtilities({
        '.tap-highlight-transparent': {
          '-webkit-tap-highlight-color': 'transparent',
        },
        '.touch-pan-y': {
          'touch-action': 'pan-y',
        },
        '.touch-pan-x': {
          'touch-action': 'pan-x',
        },
        '.touch-manipulation': {
          'touch-action': 'manipulation',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.safe-area-inset-top': {
          'padding-top': 'env(safe-area-inset-top)',
        },
        '.safe-area-inset-bottom': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
        '.safe-area-inset-left': {
          'padding-left': 'env(safe-area-inset-left)',
        },
        '.safe-area-inset-right': {
          'padding-right': 'env(safe-area-inset-right)',
        },
      });
    }
  ],
} satisfies Config;
