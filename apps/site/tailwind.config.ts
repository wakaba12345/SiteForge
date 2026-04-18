import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        accent: 'var(--color-accent)',
        surface: 'var(--color-surface)',
      },
      fontFamily: {
        heading: 'var(--font-heading)',
        body: 'var(--font-body)',
      },
      maxWidth: {
        site: 'var(--max-width)',
      },
      borderRadius: {
        theme: 'var(--border-radius)',
      },
    },
  },
  plugins: [],
};

export default config;
