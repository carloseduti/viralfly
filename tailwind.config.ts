import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#070d1f',
          dim: '#070d1f',
          bright: '#222b47',
          container: {
            lowest: '#000000',
            low: '#0c1326',
            DEFAULT: '#11192e',
            high: '#171f36',
            highest: '#1c253e'
          },
          variant: '#1c253e',
          tint: '#95aaff'
        },
        'on-surface': {
          DEFAULT: '#dfe4fe',
          variant: '#a5aac2'
        },
        primary: {
          DEFAULT: '#95aaff',
          container: '#829bff',
          dim: '#3766ff',
          action: '#0052FF',
          fixed: '#829bff',
          'fixed-dim': '#6e8cff'
        },
        'on-primary': {
          DEFAULT: '#00247e',
          container: '#001a63'
        },
        secondary: {
          DEFAULT: '#9193ff',
          container: '#3838a0',
          dim: '#9193ff',
          fixed: '#cecdff',
          'fixed-dim': '#bebeff'
        },
        'on-secondary': {
          DEFAULT: '#0c0078',
          container: '#ccccff'
        },
        tertiary: {
          DEFAULT: '#10b981',
          container: '#007550',
          dim: '#ec89da'
        },
        'on-tertiary': {
          DEFAULT: '#6f1a67',
          container: '#640d5d'
        },
        error: {
          DEFAULT: '#ff6e84',
          container: '#a70138',
          dim: '#d73357'
        },
        'on-error': {
          DEFAULT: '#490013',
          container: '#ffb2b9'
        },
        outline: {
          DEFAULT: '#6f758b',
          variant: '#41475b'
        },
        inverse: {
          surface: '#faf8ff',
          'on-surface': '#4f5469',
          primary: '#004cef'
        }
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif']
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1.5rem',
        full: '9999px'
      },
      boxShadow: {
        ambient: '0px 24px 48px -12px rgba(0, 0, 0, 0.5)',
        'glow-primary': '0px 0px 20px rgba(0, 82, 255, 0.3)',
        'glow-success': '0px 0px 20px rgba(16, 185, 129, 0.3)',
        'glow-error': '0px 0px 20px rgba(255, 110, 132, 0.3)',
        'glow-running': '0px 0px 20px rgba(55, 102, 255, 0.3)'
      },
      spacing: {
        18: '4.5rem',
        88: '22rem'
      }
    }
  },
  plugins: []
};

export default config;
