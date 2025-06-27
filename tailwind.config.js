export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
        },
        success: {
          500: '#22c55e',
          600: '#16a34a'
        },
        danger: {
          500: '#ef4444',
          600: '#dc2626'
        }
      }
    }
  },
  plugins: []
};