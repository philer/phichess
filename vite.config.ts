import { svelte } from "@sveltejs/vite-plugin-svelte"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig(() => ({
  build: {
    target: "es2022",
  },
  plugins: [svelte()],
}))
