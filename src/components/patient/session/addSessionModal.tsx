import { DatePicker } from "@/components/ui/datePicker"
import { daysOfWeek } from "@/data"
import { DayOfWeek, TreatmentPackage } from "@/types"
import { useEffect, useState } from "react"

type AddSessionModalProps = {
  isOpen: boolean
  patientType: "Pacote" | "Sessão avulsa"
  packageIsComplete?: boolean
  currentPackage?: TreatmentPackage | null
  suggestedPackageStartDate: Date
  onClose: () => void
  onContinueCurrentPackage: () => void
  onStartNextPackage: () => void
  onCreateSeparateSession: (selectedDate: Date) => void
  onCreateNextPackage: (data: {
    startDate: Date
    totalSessions: number
    valueSession: number
    fixedWeekDays: DayOfWeek[]
  }) => void
}

export function AddSessionModal({
  isOpen,
  patientType,
  packageIsComplete,
  currentPackage,
  suggestedPackageStartDate,
  onClose,
  onContinueCurrentPackage,
  onStartNextPackage,
  onCreateSeparateSession,
  onCreateNextPackage,
}: AddSessionModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [mode, setMode] = useState<
    "options" | "separate-session" | "next-package"
  >("options")

  const [packageTotalSessions, setPackageTotalSessions] = useState(10)

  const [packageValueSession, setPackageValueSession] = useState(0)

  const [packageWeekDays, setPackageWeekDays] = useState<DayOfWeek[]>([])

  const [packageStartDate, setPackageStartDate] = useState(new Date())

  function handleClose() {
    setMode("options")
    setSelectedDate(new Date())
    onClose()
  }

  function handleConfirmSeparateSession() {
    onCreateSeparateSession(selectedDate)
    handleClose()
  }

  useEffect(() => {
    if (!isOpen) return

    setMode(patientType === "Sessão avulsa" ? "separate-session" : "options")
    setSelectedDate(new Date())
  }, [isOpen, patientType])

  useEffect(() => {
    if (!isOpen) return

    if (patientType === "Pacote" && currentPackage) {
      setPackageStartDate(suggestedPackageStartDate)

      setPackageTotalSessions(currentPackage.totalSessions)

      setPackageValueSession(currentPackage.valueSession)

      setPackageWeekDays(currentPackage.fixedWeekDays)
    }
  }, [isOpen, currentPackage, patientType, suggestedPackageStartDate])

  if (!isOpen) return null

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-[#344054]">
          Adicionar sessão
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {patientType === "Sessão avulsa"
            ? "Escolha a data da nova sessão."
            : "Escolha como deseja adicionar a nova sessão."}
        </p>

        <div className="mt-5 flex flex-col gap-3">
          {mode === "options" && patientType === "Pacote" && (
            <>
              {!packageIsComplete && (
                <button
                  onClick={onContinueCurrentPackage}
                  className="rounded-lg border border-[#EAECF0] px-4 py-3 text-left text-sm font-medium text-[#344054] hover:bg-[#F9FAFB]"
                >
                  Continuar no pacote atual
                </button>
              )}

              {packageIsComplete && (
                <button
                  onClick={() => setMode("next-package")}
                  className="rounded-lg border border-[#EAECF0] px-4 py-3 text-left text-sm font-medium text-[#344054] hover:bg-[#F9FAFB]"
                >
                  Seguir com próximo pacote
                </button>
              )}

              <button
                onClick={() => setMode("separate-session")}
                className="rounded-lg border border-[#EAECF0] px-4 py-3 text-left text-sm font-medium text-[#344054] hover:bg-[#F9FAFB]"
              >
                Criar sessão avulsa
              </button>
            </>
          )}

          {mode === "separate-session" && (
            <div className="rounded-xl ">
              <DatePicker date={selectedDate} setDate={setSelectedDate} />

              <button
                onClick={handleConfirmSeparateSession}
                className="mt-3 w-full rounded-lg bg-[#FDB022] px-4 py-2 text-sm font-medium text-white hover:bg-[#F79009]"
              >
                Confirmar sessão avulsa
              </button>
            </div>
          )}

          {mode === "next-package" && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#344054]">
                  Total de sessões
                </label>

                <input
                  type="number"
                  min={1}
                  value={packageTotalSessions}
                  onChange={(e) =>
                    setPackageTotalSessions(Number(e.target.value))
                  }
                  className="w-full rounded-lg border border-[#D0D5DD] px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#344054]">
                  Valor da sessão
                </label>

                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={packageValueSession}
                  onChange={(event) =>
                    setPackageValueSession(Number(event.target.value))
                  }
                  className="w-full rounded-lg border border-[#D0D5DD] px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#344054]">
                  Dias da semana
                </label>

                <div className="flex flex-wrap gap-2">
                  {/* botões dos dias */}
                  {daysOfWeek.map((day) => {
                    const isSelected = packageWeekDays.includes(day)

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() =>
                          setPackageWeekDays((prev) =>
                            prev.includes(day)
                              ? prev.filter((item) => item !== day)
                              : [...prev, day]
                          )
                        }
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                          isSelected
                            ? "border-[#FDB022] bg-[#FFF7E8] text-[#B54708]"
                            : "border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB]"
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#344054]">
                  Início do pacote
                </label>

                <DatePicker
                  date={packageStartDate}
                  setDate={setPackageStartDate}
                />
              </div>

              <button
                onClick={() =>
                  onCreateNextPackage({
                    startDate: packageStartDate,
                    totalSessions: packageTotalSessions,
                    valueSession: packageValueSession,
                    fixedWeekDays: packageWeekDays,
                  })
                }
                className="w-full rounded-lg bg-[#FDB022] px-4 py-2 text-sm font-medium text-white"
              >
                Criar pacote
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleClose}
          className="mt-5 w-full rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
