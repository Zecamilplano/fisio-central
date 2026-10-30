import { DatePicker } from "@/components/ui/datePicker"
import { daysOfWeek } from "@/data"
import { DayOfWeek, Session, TreatmentPackage } from "@/types"
import { addDays, format } from "date-fns"
import { useEffect, useState } from "react"

const weekDayNumber: Record<DayOfWeek, number> = {
  Domingo: 0,
  Segunda: 1,
  Terça: 2,
  Quarta: 3,
  Quinta: 4,
  Sexta: 5,
  Sábado: 6,
}

type AddSessionModalProps = {
  isOpen: boolean
  initialMode?: "options" | "next-package"
  patientType: "Pacote" | "Sessão avulsa"
  packageIsComplete?: boolean
  canContinueToNextPackage?: boolean
  hasPendingExtraSessions?: boolean
  missingPackageSessions?: number
  currentPackage?: TreatmentPackage | null
  suggestedPackageStartDate: Date
  onClose: () => void
  currentPackageSessions?: Session[]
  onRestoreMissingPackageSession: (
    selectedDate?: Date,
    selectedTime?: string
  ) => void | Promise<boolean>
  onCreateSeparateSession: (
    selectedDate: Date,
    selectedTime: string
  ) => void | Promise<boolean>
  onCreateNextPackage: (data: {
    startDate: Date
    totalSessions: number
    valueSession: number
    fixedWeekDays: DayOfWeek[]
  }) => void | Promise<boolean>
}

export function AddSessionModal({
  isOpen,
  initialMode = "options",
  patientType,
  packageIsComplete,
  canContinueToNextPackage,
  hasPendingExtraSessions,
  missingPackageSessions = 0,
  currentPackage,
  currentPackageSessions = [],
  suggestedPackageStartDate,
  onClose,
  onRestoreMissingPackageSession,
  onCreateSeparateSession,
  onCreateNextPackage,
}: AddSessionModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState("16:00")
  const [mode, setMode] = useState<
    "options" | "separate-session" | "restore-session" | "next-package"
  >("options")

  const [packageTotalSessions, setPackageTotalSessions] = useState(10)

  const [packageValueSession, setPackageValueSession] = useState(0)

  const [packageWeekDays, setPackageWeekDays] = useState<DayOfWeek[]>([])

  const [packageStartDate, setPackageStartDate] = useState(new Date())
  const [isSaving, setIsSaving] = useState(false)
  const needsManualRestore = Boolean(
    currentPackage &&
      (!currentPackage.fixedWeekDays.length ||
        !Number.isFinite(currentPackage.startDate.getTime()))
  )
  const hasPackageScheduleConflict =
    patientType === "Pacote" &&
    currentPackageSessions.some(
      (session) =>
        session.date.slice(0, 10) === format(selectedDate, "yyyy-MM-dd") &&
        (session.time ?? currentPackage?.defaultTime ?? "16:00").slice(0, 5) ===
          selectedTime
    )

  useEffect(() => {
    if (!packageWeekDays.length) return

    let alignedDate = packageStartDate
    while (
      !packageWeekDays.some(
        (day) => weekDayNumber[day] === alignedDate.getDay()
      )
    ) {
      alignedDate = addDays(alignedDate, 1)
    }

    if (alignedDate.getTime() !== packageStartDate.getTime()) {
      setPackageStartDate(alignedDate)
    }
  }, [packageStartDate, packageWeekDays])

  function handleClose() {
    if (isSaving) return
    setMode("options")
    setSelectedDate(new Date())
    onClose()
  }

  function handleSaveComplete() {
    setIsSaving(false)
    setMode("options")
    setSelectedDate(new Date())
    onClose()
  }

  async function handleRestoreMissingPackageSession(manualSchedule = false) {
    setIsSaving(true)
    try {
      const created = await onRestoreMissingPackageSession(
        manualSchedule ? selectedDate : undefined,
        manualSchedule ? selectedTime : undefined
      )
      if (created !== false) handleSaveComplete()
    } finally {
      setIsSaving(false)
    }
  }

  async function handleConfirmSeparateSession() {
    setIsSaving(true)
    try {
      const created = await onCreateSeparateSession(selectedDate, selectedTime)
      if (created !== false) handleSaveComplete()
    } finally {
      setIsSaving(false)
    }
  }

  async function handleCreateNextPackage() {
    setIsSaving(true)
    try {
      const created = await onCreateNextPackage({
        startDate: packageStartDate,
        totalSessions: packageTotalSessions,
        valueSession: packageValueSession,
        fixedWeekDays: packageWeekDays,
      })
      if (created !== false) handleSaveComplete()
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    if (!isOpen) return

    setMode(
      patientType === "Sessão avulsa" ? "separate-session" : initialMode
    )
    setSelectedDate(new Date())
    setSelectedTime((currentPackage?.defaultTime ?? "16:00").slice(0, 5))
  }, [isOpen, patientType, initialMode, currentPackage])

  useEffect(() => {
    if (!isOpen) return

    if (patientType === "Pacote" && currentPackage) {
      setPackageStartDate(suggestedPackageStartDate)

      setPackageTotalSessions(currentPackage.totalSessions)

      setPackageValueSession(currentPackage.valueSession)

      setPackageWeekDays(currentPackage.fixedWeekDays)
    }
  }, [isOpen, currentPackage, patientType, suggestedPackageStartDate])

  useEffect(() => {
    if (!isOpen) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    document.body.style.overflow = "hidden"

    return () => {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

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
          {mode === "next-package" ? "Novo pacote" : "Adicionar sessão"}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {mode === "next-package"
            ? "Configure as sessões do próximo pacote."
            : patientType === "Sessão avulsa"
              ? "Escolha a data da nova sessão."
              : missingPackageSessions > 0
                ? "Reponha uma sessão excluída do pacote ou adicione uma sessão extra fora dele."
                : "Adicione uma sessão avulsa extra, separada do pacote atual."}
        </p>

        <div className="mt-5 flex flex-col gap-3">
          {mode === "options" && patientType === "Pacote" && (
            <>
              {!packageIsComplete && missingPackageSessions > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (needsManualRestore) {
                      setMode("restore-session")
                    } else {
                      void handleRestoreMissingPackageSession()
                    }
                  }}
                  disabled={isSaving}
                  className="rounded-lg border border-[#EAECF0] px-4 py-3 text-left text-sm font-medium text-[#344054] hover:bg-[#F9FAFB]"
                >
                  {isSaving
                    ? "Salvando..."
                    : "Repor sessão excluída no pacote atual"}
                  <span className="mt-1 block text-xs font-normal text-slate-500">
                    {needsManualRestore
                      ? "Defina a data e o horário para repor a sessão no pacote."
                      : missingPackageSessions === 1
                        ? "Há 1 sessão do pacote sem cadastro. Esta ação repõe essa sessão."
                        : `Há ${missingPackageSessions} sessões do pacote sem cadastro. Esta ação repõe uma por vez.`}
                  </span>
                </button>
              )}

              {packageIsComplete && canContinueToNextPackage && (
                <button
                  onClick={() => setMode("next-package")}
                  className="rounded-lg border border-[#EAECF0] px-4 py-3 text-left text-sm font-medium text-[#344054] hover:bg-[#F9FAFB]"
                >
                  Seguir com próximo pacote
                </button>
              )}

              {packageIsComplete && hasPendingExtraSessions && (
                <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Conclua a sessão avulsa extra para seguir com o próximo
                  pacote.
                </p>
              )}

              <button
                onClick={() => setMode("separate-session")}
                className="rounded-lg border border-[#EAECF0] px-4 py-3 text-left text-sm font-medium text-[#344054] hover:bg-[#F9FAFB]"
              >
                {patientType === "Pacote"
                  ? "Adicionar sessão avulsa extra · fora do pacote"
                  : "Criar sessão avulsa"}
              </button>
            </>
          )}

          {mode === "separate-session" && (
            <div className="rounded-xl ">
              {patientType === "Pacote" && (
                <p className="mb-3 text-sm text-slate-500">
                  Esta sessão será avulsa e ficará fora do pacote atual.
                </p>
              )}
              <DatePicker date={selectedDate} setDate={setSelectedDate} />

              {patientType === "Pacote" && (
                <label className="mt-3 block text-sm font-medium text-slate-600">
                  Horário
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(event) => setSelectedTime(event.target.value)}
                    aria-invalid={hasPackageScheduleConflict}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-800 ${hasPackageScheduleConflict ? "border-red-500" : "border-slate-300"}`}
                  />
                </label>
              )}
              {hasPackageScheduleConflict && (
                <p role="alert" className="mt-1 text-sm text-red-600">
                  Já existe uma sessão do pacote neste dia e horário. Escolha outro horário.
                </p>
              )}

              <button
                type="button"
                onClick={handleConfirmSeparateSession}
                disabled={isSaving || hasPackageScheduleConflict}
                className="mt-3 w-full rounded-lg bg-[#FDB022] px-4 py-2 text-sm font-medium text-white hover:bg-[#F79009]"
              >
                {isSaving
                  ? "Salvando..."
                  : patientType === "Pacote"
                    ? "Confirmar sessão avulsa extra"
                    : "Confirmar sessão avulsa"}
              </button>
            </div>
          )}

          {mode === "restore-session" && (
            <div>
              <p className="mb-3 text-sm text-slate-500">
                Este pacote não tem dias ou data inicial definidos. Escolha quando repor a sessão.
              </p>
              <DatePicker date={selectedDate} setDate={setSelectedDate} />
              <label className="mt-3 block text-sm font-medium text-slate-600">
                Horário
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(event) => setSelectedTime(event.target.value)}
                  aria-invalid={hasPackageScheduleConflict}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-800 ${hasPackageScheduleConflict ? "border-red-500" : "border-slate-300"}`}
                />
              </label>
              {hasPackageScheduleConflict && (
                <p role="alert" className="mt-1 text-sm text-red-600">
                  Já existe uma sessão do pacote neste dia e horário. Escolha outro horário.
                </p>
              )}
              <button
                type="button"
                onClick={() => void handleRestoreMissingPackageSession(true)}
                disabled={isSaving || hasPackageScheduleConflict}
                className="mt-3 w-full rounded-lg bg-[#FDB022] px-4 py-2 text-sm font-medium text-white hover:bg-[#F79009] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Salvando..." : "Confirmar reposição no pacote"}
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
                  setDate={(date) => setPackageStartDate(date)}
                />
              </div>

              <button
                type="button"
                onClick={handleCreateNextPackage}
                disabled={isSaving}
                className="w-full rounded-lg bg-[#FDB022] px-4 py-2 text-sm font-medium text-white"
              >
                {isSaving ? "Salvando..." : "Criar pacote"}
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleClose}
          disabled={isSaving}
          className="mt-5 w-full rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
