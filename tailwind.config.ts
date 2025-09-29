import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#05060A",
        foreground: "#F3F4F6",
        primary: {
          DEFAULT: "#FF375F",
          foreground: "#05060A"
        },
        muted: "#1F2933",
        accent: "#4ADE80"
      },
      borderRadius: {
        lg: "1rem"
      },
      boxShadow: {
        soft: "0 10px 40px rgba(0,0,0,0.35)"
      }
    }
  },
  plugins: [tailwindcssAnimate]
};

export default config;
