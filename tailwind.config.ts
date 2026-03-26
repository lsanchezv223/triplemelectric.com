import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#091628",
        sand: "#f6f2ea",
        ember: "#ff7a18",
        slateBlue: "#9fd2ff"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(159, 210, 255, 0.28), 0 20px 50px -24px rgba(0, 0, 0, 0.45)"
      },
      backgroundImage: {
        grid:
          "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
