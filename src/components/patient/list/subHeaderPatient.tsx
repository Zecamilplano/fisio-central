import { Search } from "lucide-react"
import Link from "next/link"

export function SubHeaderPatientList() {
  return (
    <header className="flex flex-col justify-between gap-4 px-2 py-6 lg:flex-row">
      <form
        role="search"
        className="flex h-14 w-full items-center justify-between rounded-4xl bg-white px-4 py-2 lg:w-1/3"
      >
        <input
          type="search"
          placeholder="Procurar por pacientes"
          className="w-full text-base outline-none placeholder:text-[#9CA3AF] md:text-xl"
        />

        <Search size={28} color="#9CA3AF" className="shrink-0" />
      </form>

      <Link
        href="/cadastrar-paciente"
        className="flex w-full items-center justify-center rounded-4xl bg-[#FFA726] px-2 py-3 text-lg text-white md:text-2xl lg:w-75 lg:rounded-md"
      >
        Adicionar paciente
      </Link>
    </header>
  )
}
