import Link from "next/link"

export function PatientEmptyState() {
  return (
    <section className="flex w-full flex-col items-center justify-center rounded-md bg-white p-6 text-center">
      <p className="text-[#485368]">
        Selecione um paciente para visualizar mais informações do paciente
        <br />
        ou
      </p>

      <Link href="/cadastrar-paciente" className="text-[#2563EB]">
        Adicione um novo paciente
      </Link>
    </section>
  )
}
