import Image from "next/image"
import type { ListPatient } from "@/types"
import { getInitialLetters } from "@/utils/patient/getInitialLetters"

type PatientSidebarProps = {
  patients: ListPatient[]
  selectedPatientId: number | null
  onSelectPatient: (id: number) => void
}

export function PatientSidebar({
  patients,
  selectedPatientId,
  onSelectPatient,
}: PatientSidebarProps) {
  return (
    <aside className="flex max-h-96 w-90 shrink-0 overflow-x-hidden overflow-y-auto rounded-l-md bg-white lg:ml-2 lg:max-h-255 lg:w-80">
      <ol className="w-full">
        {patients.map((patient) => {
          const initialLetters = getInitialLetters(patient.name)

          return (
            <li key={patient.id} className="font-open-sans w-full">
              <div className="h-2 w-full bg-[#E0E0E0]" />

              <button
                onClick={() => onSelectPatient(patient.id)}
                className={`flex w-full items-center gap-3 p-3 transition-all duration-200 hover:bg-[#F5F7FA] ${
                  selectedPatientId === patient.id ? "bg-[#E8F0FF]" : "bg-white"
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
                  {patient.name}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </aside>
  )
}
