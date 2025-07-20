import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [
    typography,
    nextui({
      themes: {
        light: {
          colors: {
            background: "#FFFFFF",
            foreground: "#11181C",
            primary: {
              "50": "#e6f1fe",
              "100": "#cce3fd",
              "200": "#99c7fb",
              "300": "#66aaf9",
              "400": "#338ef7",
              "500": "#006FEE",
              "600": "#005bc4",
              "700": "#004493",
              "800": "#002e62",
              "900": "#001731",
              DEFAULT: "#006FEE",
              foreground: "#ffffff",
            },
            secondary: {
              DEFAULT: "#9353d3",
              foreground: "#ffffff",
            },
          },
        },
      },
    }),
  ],
};
export default config;
