/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm cream background palette
        cream:    '#FEFCF8',
        warm:     '#FAF7F2',
        white:    '#FFFFFF',
        border:   '#E5DDD5',
        'border-strong': '#C9BAB0',

        // Text
        ink:      '#1C1310',
        body:     '#2D1F17',
        dim:      '#7A6860',
        muted:    '#B09A8E',
        placeholder: '#C4B4AB',

        // Accents
        amber:    '#C8873A',   // primary — warm Islamic gold
        'amber-dark':  '#A0621A',
        'amber-light': '#F5A84A',
        'amber-bg':    '#FEF3E2',
        green:    '#1B6B45',   // secondary — Islamic green
        'green-bg': '#EDFAF3',
        purple:   '#6D3BA0',   // Arabic recitation
        'purple-bg': '#F3EEFF',
        red:      '#C0392B',
        blue:     '#1D5C96',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        reading: ['Lora', 'Georgia', 'serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'reading': ['16.5px', { lineHeight: '1.9' }],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}
