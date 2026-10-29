import Link from "next/link"
import { UserRoundSearch } from "lucide-react"

export function PatientEmptyState() {
  return (
    <section className="flex h-full min-h-0 w-full items-center justify-center rounded-r-md bg-white p-5 text-center sm:p-8 lg:p-10">
      <div className="w-full max-w-lg">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 sm:h-20 sm:w-20">
          <UserRoundSearch size={36} strokeWidth={1.7} />
        </div>

        <h2 className="text-lg font-semibold text-slate-800 sm:text-xl">
          Nenhum paciente selecionado
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
          Escolha um paciente na lista para consultar seus dados e sessões, ou
          cadastre um novo paciente.
        </p>

        <Link
          href="/cadastrar-pacientes"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
        >
          Cadastrar paciente
        </Link>
      </div>
    </section>
  )
}
