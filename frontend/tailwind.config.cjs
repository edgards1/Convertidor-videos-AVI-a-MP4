module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#151515",
        fog: "#f7f1e8",
        coral: "#ff6a4c",
        haze: "#b6c1d9",
        moss: "#4b6b4f"
      },
      boxShadow: {
        soft: "0 20px 60px -30px rgba(0, 0, 0, 0.35)"
      }
    }
  },
  plugins: []
};
