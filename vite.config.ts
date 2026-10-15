import react from "@vitejs/plugin-react"
import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import { specSave } from "./src/shared/vite/specSave.node.ts"

const path = (relative: string) => fileURLToPath(new URL(relative, import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    specSave({
      name: "civil-service:hex-spec-save",
      route: "/__hex-spec",
      specPath: path("./src/games/civil-service/map/hexSpec.json"),
      build: { script: path("./src/games/civil-service/map/build.ts"), tsx: path("./node_modules/.bin/tsx") }
    })
  ],
  resolve: {
    alias: {
      "~": path("./src")
    }
  }
})
