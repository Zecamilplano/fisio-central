import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // logs de depuração não devem ir para produção; erros e avisos são permitidos
      "no-console": ["warn", { allow: ["error", "warn"] }],
      // "_" e "__" para ignorar campos ao desestruturar (ex.: remover uma chave do objeto)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
      // Regra nova do React Compiler. O código atual tem ~20 setState dentro de
      // useEffect (restaurar rascunho, resetar formulário); refatorar sem testes de
      // tela é arriscado, então fica como aviso até ser revisado um a um.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "graphify-out/**",
    "supabase/**",
  ]),
])
