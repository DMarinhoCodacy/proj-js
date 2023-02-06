/* eslint-disable import/no-extraneous-dependencies */
const defaultTheme = require("tailwindcss/defaultTheme")
const colors = require("tailwindcss/colors")

module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.js",
    "./plugins/**/*.ts",
    "./nuxt.config.js",
  ],
  theme: {
    // https://tailwindcss.com/docs/theme#extending-the-default-theme
    extend: {
      fontFamily: {
        serif: ["DM Serif Text", ...defaultTheme.fontFamily.serif],
        sans: ["DM Sans", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        current: "currentColor",
        navy: {
          DEFAULT: "#232463",
          50: "#FBFBFB",
          100: "#F7F7F7",
          200: "#ECECED",
          300: "#D2D3D9",
          400: "#A1A3B5",
          500: "#898CA6",
          600: "#717397",
          700: "#535486",
          800: "#3F4077",
          900: "#232463",
          950: "#05054E",
        },
        blue: {
          DEFAULT: "#4494FE",
          50: "#F3F9FF",
          100: "#E5F0FE",
          200: "#D3E5FB",
          300: "#AED2FD",
          400: "#AED2FD",
          500: "#4494FE",
          600: "#2A7DF1",
          700: "#1C63DB",
          800: "#0F48BF",
          900: "#0E2FA4",
        },
        marigold: {
          DEFAULT: "#F0B23A",
          50: "#FEFBF5",
          100: "#FDF7EB",
          200: "#E4F3EF",
          300: "#FAE5BC",
          400: "#F5CB7B",
          500: "#F0B23A",
          600: "#CE9B33",
          700: "#967327",
          800: "#755A1F",
          900: "#534117",
        },
        linen: "#F8F7F1",
        outline: "#ABABC3",
        accent: {
          DEFAULT: "#D3D3E0",
          secondary: "#FAE5BC",
          tertiary: "#EDF7F4",
        },
        text: {
          primary: colors.navy,
          secondary: "#5F608C",
        },
        inactive: {
          DEFAULT: "#D7D7E2",
          500: "#D7D7E2",
        },
        success: {
          DEFAULT: "#75d279",
          50: "#F8FDF8",
          100: "#F1FAF1",
          200: "#DEF4DF",
          300: "#D0F0D1",
          400: "#A2E1A5",
          500: "#75D279",
          600: "#62B069",
          700: "#498852",
          800: "#386B41",
          900: "#284D30",
        },
        warning: {
          DEFAULT: "#F0B23A",
          50: "#FEFBF5",
          100: "#FDF7EB",
          200: "#FCF0D8",
          300: "#FAE5BC",
          400: "#F5CB7B",
          500: "#F5CB7B",
          600: "#C79530",
          700: "#967327",
          800: "#755A1F",
          900: "#755A1F",
        },
        fail: {
          DEFAULT: "#FF5A79",
          50: "#FFF7F8",
          100: "#FFEFF1",
          200: "#FFDDE3",
          300: "#FFC7D1",
          400: "#FF90A5",
          500: "#FF5A79",
          600: "#D24C68",
          700: "#9F3A52",
          800: "#7B2E41",
          900: "#582130",
        },
        black: "#20262D",
        primary: colors.navy,
      },
      cursor: {
        "col-resize": "col-resize",
      },
      keyframes: {
        // Animation to use in loading Skeleton
        // Allows us to move a gradient from left to right
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
      },
    },
  },
  // eslint-disable-next-line global-require
  plugins: [require("@tailwindcss/forms")],
}