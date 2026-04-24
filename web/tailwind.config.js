const daisyThemes = require("daisyui/src/theming/themes");

module.exports = {
  content: ["./src/**/*.{vue,js,ts}"],
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          ...daisyThemes.light,
          primary: "oklch(60% 0.08 245)",
          "primary-content": "oklch(98% 0.01 240)",
          secondary: "oklch(82% 0.05 15)",
          "secondary-content": "oklch(28% 0.03 240)",
          accent: "oklch(86% 0.05 90)",
          "accent-content": "oklch(30% 0.03 90)",
          neutral: "oklch(28% 0.02 250)",
          "neutral-content": "oklch(96% 0.01 240)",
          "base-100": "oklch(99.2% 0.004 250)",
          "base-200": "oklch(97.6% 0.006 250)",
          "base-300": "oklch(95.5% 0.008 250)",
          "base-content": "oklch(24% 0.02 250)",
          info: "oklch(76% 0.09 240)",
          success: "oklch(78% 0.08 160)",
          warning: "oklch(82% 0.09 90)",
          error: "oklch(70% 0.14 24)",
        },
      },
      "dark",
      "cupcake",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
      "dim",
      "nord",
      "sunset",
    ],
  },
};
