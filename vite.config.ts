import { svelte } from "@sveltejs/vite-plugin-svelte"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "./",
  build: {
    target: "es2022",
  },
  plugins: [
    svelte(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "inline",
      devOptions: { enabled: mode === "development" },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
      manifest: {
        name: "phichess",
        short_name: "phichess",
        description: "Play over the board chess on any device",
        display: "standalone",
        start_url: "./",
        scope: "./",
        theme_color: "#222222",
        background_color: "#f0d9b5",
        icons: [
          { src: "./icons/phichess-512.png", sizes: "512x512", type: "image/png" },
          { src: "./icons/phichess-256.png", sizes: "256x256", type: "image/png" },
          { src: "./icons/phichess-192.png", sizes: "192x192", type: "image/png" },
          { src: "./icons/phichess-144.png", sizes: "144x144", type: "image/png" },
          { src: "./icons/phichess-128.png", sizes: "128x128", type: "image/png" },
          { src: "./icons/phichess-64.png", sizes: "64x64", type: "image/png" },
          { src: "./icons/phichess-32.png", sizes: "32x32", type: "image/png" },
        ],
      },
    }),
  ],
}))
