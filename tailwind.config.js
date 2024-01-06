const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans]
      },
      colors: {
        theme: 'hsl(var(--theme))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        // error
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        warning: 'hsl(var(--warning))'
      },
      backgroundImage: {
        'theme-gradient': 'linear-gradient(136deg, #FDB747 12%, #CB3732 70%, #D13E36 80%, #DF4D40 100%)',
      },
      padding: {
        'safe-area-top': 'env(safe-area-inset-top)',
        'safe-area-bottom': 'env(safe-area-inset-bottom)'
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: 'calc(var(--radius) - 4px)'
      },
      dropShadow: {
        "text": [
          '0 0 2px hsl(0 0% 100% / 0.6)',
          '0 0 24px hsl(0 0% 100% / 0.3)'
        ],
        "text-dark": [
          '0 0 2px hsl(240 10% 3.9% / 0.6)',
          '0 0 24px hsl(240 10% 3.9% / 0.3)'
        ],

      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 }
        },
        'slide-from-left': {
          '0%': {
            transform: 'translateX(-100%)'
          },
          '100%': {
            transform: 'translateX(0)'
          }
        },
        'slide-from-right': {
          '0%': {
            transform: 'translateX(100%)'
          },
          '100%': {
            transform: 'translateX(0)'
          }
        },
        'slide-to-left': {
          '0%': {
            transform: 'translateX(0)'
          },
          '100%': {
            transform: 'translateX(-100%)'
          }
        },
        'ping-sm': {
          "75%, 100%": {
            transform: "scale(1.1)",
            opacity: 0,
          }
        }
      },
      animation: {
        'ping-sm': "ping-sm 1s cubic-bezier(0, 0, 0.2, 1) infinite",
        'slide-from-left':
          'slide-from-left 0.3s cubic-bezier(0.82, 0.085, 0.395, 0.895)',
        'slide-to-left':
          'slide-to-left 0.25s cubic-bezier(0.82, 0.085, 0.395, 0.895)',
        'slide-from-right':
          'slide-from-right 0.3s cubic-bezier(0.82, 0.085, 0.395, 0.895)',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')]
}
