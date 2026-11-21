import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3525cd",
          container: "#4f46e5",
          fixed: "#e2dfff",
          "fixed-dim": "#c3c0ff",
          "on-container": "#dad7ff",
        },
        secondary: {
          DEFAULT: "#515f74",
          container: "#d5e3fc",
          fixed: "#d5e3fc",
          "fixed-dim": "#b9c7df",
          "on-container": "#57657a",
        },
        tertiary: {
          DEFAULT: "#005338",
          container: "#006e4b",
          fixed: "#6ffbbe",
          "fixed-dim": "#4edea3",
          "on-container": "#67f4b7",
        },
        surface: {
          DEFAULT: "#faf8ff",
          dim: "#d2d9f4",
          bright: "#faf8ff",
          container: "#eaedff",
          "container-low": "#f2f3ff",
          "container-lowest": "#ffffff",
          "container-high": "#e2e7ff",
          "container-highest": "#dae2fd",
          variant: "#dae2fd",
          tint: "#4d44e3",
        },
        "on-surface": "#131b2e",
        "on-surface-variant": "#464555",
        "on-primary": "#ffffff",
        "on-secondary": "#ffffff",
        "on-tertiary": "#ffffff",
        "on-error": "#ffffff",
        outline: "#777587",
        "outline-variant": "#c7c4d8",
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
          "on-container": "#93000a",
        },
        "inverse-surface": "#283044",
        "inverse-on-surface": "#eef0ff",
        "inverse-primary": "#c3c0ff",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2rem",
        "gutter-lg": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
