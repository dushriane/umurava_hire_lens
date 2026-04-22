/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Umurava / Competence brand colors (from actual platform)
        umurava: {
          primary:      '#2563EB',  // royal blue — sidebar, buttons
          'primary-dark': '#1D4ED8',
          'primary-light': '#EFF6FF',
          'primary-mid':  '#3B82F6',
          sidebar:      '#2563EB',
          'sidebar-text': '#BFDBFE',
          yellow:       '#FBBF24',  // "Ongoing" badge
          'yellow-text': '#92400E',
          bg:           '#F3F4F6',  // page background
          border:       '#E5E7EB',
          text:         '#111827',
          muted:        '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xl2': '1rem',
      },
    },
  },
  plugins: [],
}