import Image from "next/image"
import type { ListPatient } from "@/types"
import { getInitialLetters } from "@/utils/patient/getInitialLetters"

type PatientSidebarProps = {
  patients: ListPatient[]
  selectedPatientId: number | null
  search: string
  onSelectPatient: (id: number) => void
}

function highlightSearch(name: string, search: string) {
  if (!search) return name

  const index = name.toLocaleLowerCase().indexOf(search.toLocaleLowerCase())

  if (index === -1) return name

  return (
    <>
      {name.slice(0, index)}

      <span className="font-semibold text-amber-500">
        {name.slice(index, index + search.length)}
      </span>

      {name.slice(index + search.length)}
    </>
  )
}

export function PatientSidebar({
  patients,
  selectedPatientId,
  search,
  onSelectPatient,
}: PatientSidebarProps) {
  return (
    <aside className="flex max-h-96 w-90 shrink-0 overflow-x-hidden overflow-y-auto rounded-l-md bg-white lg:ml-2 lg:max-h-255 lg:w-80">
      {patients.length === 0 && (
        <p className="w-full h-full flex justify-center items-center text-sm font-semibold text-slate-700">
          Nenhum paciente encontrado
        </p>
      )}

      {patients.length > 0 && (
        <ol className="w-full">
          {patients.map((patient) => {
            const initialLetters = getInitialLetters(patient.name)

            return (
              <li key={patient.id} className="font-open-sans w-full">
                <button
                  onClick={() => onSelectPatient(patient.id)}
                  className={`flex w-full items-center gap-3 p-3 transition-all duration-200 hover:bg-[#F5F7FA] ${
                    selectedPatientId === patient.id
                      ? "bg-[#E8F0FF]"
                      : "bg-white"
                  }`}
                >
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFA726]">
                    {patient.image ? (
                      <Image
                        src={patient.image}
                        fill
                        alt={`Foto de perfil de ${patient.name}`}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-white uppercase">
                        {initialLetters}
                      </p>
                    )}
                  </div>

                  <span className="text-left text-sm wrap-break-words text-[#1B4332] md:text-base">
                    <p>{highlightSearch(patient.name, search)}</p>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      )}
      <div className="h-full w-0.5  bg-[#E0E0E0]" />
    </aside>
  )
}
