"use client"

import { useEffect } from "react"
import "./globals.css"

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

// Só aparece quando o próprio layout raiz quebra; por isso precisa de <html> e <body>
// e não usa o Header nem as fontes do layout.
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Erro no layout raiz:", error)
  }, [error])

  return (
    <html lang="pt-BR">
      <body className="flex min-h-dvh items-center justify-center bg-green-700 px-4 font-sans antialiased">
        <main className="w-full max-w-120 rounded-md bg-white px-6 py-10 text-center shadow-2xl">
          <h1 className="text-2xl font-semibold text-[#2D2D2D]">
            O FisioCentral encontrou um problema
          </h1>
          <p className="mt-3 text-base text-[#8C7B6B]">
            Tente novamente. Se não resolver, recarregue a página.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 w-full cursor-pointer rounded-md bg-[#FFA725] py-3 text-lg text-white hover:opacity-80 active:opacity-60"
          >
            Tentar novamente
          </button>
          {error.digest && (
            <p className="pt-4 text-xs text-gray-400">
              Código do erro: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  )
}
