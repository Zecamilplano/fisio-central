import type { Metadata } from "next"
import Link from "next/link"
import { SearchX } from "lucide-react"
import {
  StatusPage,
  primaryActionClassName,
  secondaryActionClassName,
} from "@/components/ui/statusPage"

export const metadata: Metadata = {
  title: "Página não encontrada",
}

export default function NotFound() {
  return (
    <StatusPage
      icon={SearchX}
      code="404"
      title="Página não encontrada"
      description="O endereço que você acessou não existe ou foi alterado. Confira o link ou volte para uma das telas abaixo."
    >
      <Link href="/listar-pacientes" className={primaryActionClassName}>
        Ver pacientes
      </Link>
      <Link href="/cadastrar-pacientes" className={secondaryActionClassName}>
        Cadastrar paciente
      </Link>
    </StatusPage>
  )
}
