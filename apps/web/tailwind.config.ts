import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta inicial do KixiHost — a confirmar com brand identity (regra sobre entrepreneurship/brand).
        brand: {
          DEFAULT: "#0EA5A4",
          dark: "#0B7A79",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
