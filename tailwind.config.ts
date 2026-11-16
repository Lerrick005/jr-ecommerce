import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { "2xl": "1440px" } },
    extend: {
      colors: {
        ivory:    "#F5EFE5",
        surface:  "#FAFAFA",
        espresso: "#2B1A10",
        muted:    "#7A6353",
        line:     "#E5E5E5",
        gold:     { DEFAULT: "#C45A3B", hover: "#A8492E" },
        sale:     "#D32F2F",
        success:  "#2E7D32",
        amber:    "#F5A623",
        ink:      "#1A120B"
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans:    ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"]
      },
      borderRadius: { lg: "0.5rem", md: "0.25rem", sm: "0.125rem" },
      letterSpacing: { editorial: "0.02em", wide: "0.08em" },
      aspectRatio: { editorial: "4 / 5" }
    }
  },
  plugins: []
};

export default config;