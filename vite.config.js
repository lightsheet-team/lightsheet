// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        manifest: true,
        minify: true,
        reportCompressedSize: true,
        lib: {
            entry: resolve(__dirname, "src/main.ts"),
            fileName: "main",
            formats: ["es"],
        },
    }
})