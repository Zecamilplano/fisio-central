import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

// As regras de agenda dependem do fuso (bug do UTC na data inicial),
// então os testes rodam sempre no horário de Brasília.
process.env.TZ = "America/Sao_Paulo"

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
})
