"use client"

import { useEffect } from "react"
import Link from "next/link"
import { TriangleAlert } from "lucide-react"
import {
  StatusPage,
  primaryActionClassName,
  secondaryActionClassName,
} from "@/components/ui/statusPage"

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Erro não tratado na página:", error)
  }, [error])

  return (
    <StatusPage
      icon={TriangleAlert}
      title="Algo deu errado"
      description="Não foi possível carregar esta tela. Seus dados já salvos não foram perdidos. Tente novamente; se o problema continuar, recarregue a página."
    >
      <button type="button" onClick={reset} className={primaryActionClassName}>
        Tentar novamente
      </button>
      <Link href="/listar-pacientes" className={secondaryActionClassName}>
        Voltar para os pacientes
      </Link>

      {error.digest && (
        <p className="pt-2 text-xs text-gray-400">
          Código do erro: {error.digest}
        </p>
      )}
    </StatusPage>
  )
}
