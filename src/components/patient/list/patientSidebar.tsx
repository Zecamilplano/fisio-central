import Image from "next/image"
import type { ListPatient } from "@/types"
import { getInitialLetters } from "@/utils/patient/getInitialLetters"
import { format, parseISO } from "date-fns"

type PatientSidebarProps = {
  patients: ListPatient[]
  selectedPatientId: string | null
  search: string
  onSelectPatient: (id: string) => void
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
  const today = format(new Date(), "yyyy-MM-dd")

  return (
    <aside className="h-full min-h-0 w-full shrink-0 overflow-x-hidden overflow-y-auto rounded-md bg-white lg:ml-2 lg:rounded-l-md lg:rounded-r-none lg:border-r lg:border-slate-200">
      {patients.length === 0 && (
        <p className="w-full h-full flex justify-center items-center text-sm font-semibold text-slate-700">
          Nenhum paciente encontrado
        </p>
      )}

      {patients.length > 0 && (
        <ol className="w-full">
          {patients.map((patient) => {
            const patientName = `${patient.firstName} ${patient.surName}`.trim()
            const initialLetters = getInitialLetters(patientName)
            const nextPendingSession = patient.session
              .filter(
                (session) =>
                  session.finish === "pendente" &&
                  session.date.slice(0, 10) >= today
              )
              .sort(
                (a, b) =>
                  a.date.localeCompare(b.date) ||
                  (a.time ?? "").localeCompare(b.time ?? "")
              )[0]
            const nextSessionLabel = nextPendingSession
              ? ` · Próxima: ${format(parseISO(nextPendingSession.date), "dd/MM")}${
                  nextPendingSession.time
                    ? ` às ${nextPendingSession.time.slice(0, 5)}`
                    : ""
                }`
              : ""

            return (
              <li key={patient.id} className="font-open-sans w-full">
                <button
                  onClick={() => onSelectPatient(patient.id)}
                  type="button"
                  data-patient-id={patient.id}
                  aria-pressed={selectedPatientId === patient.id}
                  className={`flex min-w-0 w-full items-center gap-3 p-3 transition-all duration-200 hover:bg-[#F5F7FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500 ${
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
                        alt={`Foto de perfil de ${patientName}`}
                        className="rounded-full object-cover"
                        unoptimized
                        loading="lazy"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-white uppercase">
                        {initialLetters}
                      </p>
                    )}
                  </div>

                  <span className="min-w-0 flex-1 text-left">
                    <span className="block truncate text-sm text-[#1B4332] md:text-base">
                      {highlightSearch(patientName, search)}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                      {patient.typeService}{nextSessionLabel}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      )}
    </aside>
  )
}
