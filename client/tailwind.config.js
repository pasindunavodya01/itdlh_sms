/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Your custom color palette
        firebrick: '#B30C0C',  // main red
        darkRed: '#5E1016',    // dark shade
        deepRed: '#800E12',    // deeper shade
        gold: '#FBB300',       // accent color
      },
    },
  },
  plugins: [],
};
