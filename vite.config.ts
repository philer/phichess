import { svelte } from "@sveltejs/vite-plugin-svelte"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    target: "es2022",
  },
  // css: {
  //   modules: {
  //     generateScopedName: mode === "development"
  //       ? "[name]_[local]_[hash:base64:5]"
  //       : "[hash:base64:6]",
  //   },
  //   preprocessorOptions: {
  //     scss: {
  //       charset: false,
  //     },
  //   },
  // },
  plugins: [svelte()],
}))
