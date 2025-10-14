/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        'medieval': ['"Cinzel"', 'serif'],
        'body': ['"Crimson Text"', 'serif'],
      },
      backgroundImage: {
        'parchment': "url('data:image/svg+xml,%3Csvg width=\"400\" height=\"400\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\" /%3E%3CfeColorMatrix type=\"saturate\" values=\"0\" /%3E%3C/filter%3E%3Crect width=\"400\" height=\"400\" filter=\"url(%23noise)\" opacity=\"0.05\" /%3E%3C/svg%3E')",
        'leather': "url('data:image/svg+xml,%3Csvg width=\"400\" height=\"400\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.5\" numOctaves=\"3\" /%3E%3CfeColorMatrix type=\"saturate\" values=\"0\" /%3E%3C/filter%3E%3Crect width=\"400\" height=\"400\" filter=\"url(%23noise)\" opacity=\"0.1\" /%3E%3C/svg%3E')",
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        dnd: {
          "primary": "#8B4513",           // Marrón cuero
          "secondary": "#DAA520",         // Dorado
          "accent": "#B8860B",            // Dorado oscuro
          "neutral": "#2C1810",           // Marrón muy oscuro
          "base-100": "#1a1410",          // Fondo oscuro pergamino
          "base-200": "#2d241c",          // Fondo medio
          "base-300": "#3d302a",          // Fondo claro
          "info": "#4682B4",              // Azul acero
          "success": "#228B22",           // Verde bosque
          "warning": "#FF8C00",           // Naranja oscuro
          "error": "#8B0000",             // Rojo oscuro
        },
      },
    ],
  },
}