import { Search, X } from "lucide-react"
import Link from "next/link"
import React, { useState } from "react"

type SubHeaderPatientList = {
  onSearchChange: (e: string) => void
}

export function SubHeaderPatientList({ onSearchChange }: SubHeaderPatientList) {
  const [search, setSearch] = useState<string>("")

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.trim().toLocaleLowerCase()
    setSearch(value)

    onSearchChange(value)
  }

  return (
    <header className="flex flex-col justify-between gap-4 px-2 py-6 lg:flex-row">
      <form
        role="search"
        className="flex h-14 w-full items-center justify-between rounded-4xl bg-white px-4 py-2 lg:w-1/3"
      >
        <input
          type="text"
          value={search}
          onChange={handleChange}
          placeholder="Procurar por pacientes"
          className="w-full text-base outline-none placeholder:text-[#9CA3AF] md:text-xl"
        />

        {search.trim().length > 0 ? (
          <X
            size={28}
            className="shrink-0 text-slate-400 hover:text-red-500 hover:opacity-80 active:opacity-60"
          />
        ) : (
          <Search size={28} color="#9CA3AF" className="shrink-0" />
        )}
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
