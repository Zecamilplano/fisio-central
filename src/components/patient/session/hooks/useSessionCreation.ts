import type { DayOfWeek, ListPatient, Session, TreatmentPackage } from "@/types"
import { useFisioStore } from "@/store/fisio/fisioStore"
import { parseISO } from "date-fns"
import {
  addPackageSession,
  addSingleTreatmentSession,
  addStandaloneSessionToPatient,
  createNextPackageTreatment,
} from "@/services/patients/patientScheduleRepository"
import { toast } from "react-toastify"

type UseSessionCreationProps = {
  patient: ListPatient
  currentPackage: TreatmentPackage | null
  currentPackageSessions: Session[]
  getNextPackageDate: (lastDate: Date, fixedWeekDays: DayOfWeek[]) => Date
  getFirstPackageDate: (startDate: Date, fixedWeekDays: DayOfWeek[]) => Date
}

export function useSessionCreation({
  patient,
  currentPackage,
  currentPackageSessions,
  getNextPackageDate,
  getFirstPackageDate,
}: UseSessionCreationProps) {
  const addSession = useFisioStore((state) => state.addSession)
  const startNextPackage = useFisioStore((state) => state.startNextPackage)
  async function addSeparateSession(
    selectedDate: Date,
    selectedTime = "16:00"
  ): Promise<boolean> {
    if (patient.typeService === "Sessão avulsa") {
      try {
        const saved = await addSingleTreatmentSession(
          patient.id,
          selectedDate,
          undefined,
          selectedTime
        )
        addSession(patient.id, {
          id: saved.id,
          number: saved.number,
          date: saved.date,
          time: selectedTime,
          finish: "pendente",
          paid: "pendente",
        })
        toast.success("Sessão avulsa salva no servidor.")
        return true
      } catch (error) {
        toast.error(
          error instanceof Error
            ? `Não foi possível adicionar a sessão: ${error.message}`
            : "Não foi possível adicionar a sessão."
        )
        return false
      }
    }

    try {
      const saved = await addStandaloneSessionToPatient(
        patient.id,
        selectedDate,
        currentPackage?.valueSession ?? 0,
        selectedTime,
        currentPackage?.id
      )
      addSession(patient.id, {
        id: saved.id,
        number: saved.number,
        ...(currentPackage ? { originPackageId: currentPackage.id } : {}),
        isExtra: Boolean(currentPackage),
        date: saved.date,
        time: selectedTime,
        finish: "pendente",
        paid: "pendente",
      })
      toast.success(
        "Sessão avulsa extra adicionada fora do pacote e salva no servidor."
      )
      return true
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `Não foi possível adicionar a sessão: ${error.message}`
          : "Não foi possível adicionar a sessão."
      )
      return false
    }
  }

  async function restoreMissingPackageSession(
    selectedDate?: Date,
    selectedTime?: string
  ): Promise<boolean> {
    if (patient.typeService !== "Pacote" || !currentPackage) return false

    const lastPackageSession = [...currentPackageSessions].sort((a, b) =>
      a.date.localeCompare(b.date)
    ).at(-1)
    const hasPackageSchedule =
      currentPackage.fixedWeekDays.length > 0 &&
      Number.isFinite(currentPackage.startDate.getTime())
    const nextDate = selectedDate ?? (
      hasPackageSchedule
        ? lastPackageSession
          ? getNextPackageDate(
              parseISO(lastPackageSession.date),
              currentPackage.fixedWeekDays
            )
          : getFirstPackageDate(
              currentPackage.startDate,
              currentPackage.fixedWeekDays
            )
        : null
    )

    if (!nextDate) {
      toast.error("Escolha uma data para repor a sessão do pacote.")
      return false
    }

    try {
      const saved = await addPackageSession(
        currentPackage.id,
        nextDate,
        selectedTime ?? currentPackage.defaultTime
      )
      addSession(patient.id, {
        id: saved.id,
        number: saved.number,
        packageId: currentPackage.id,
        date: saved.date,
        time: selectedTime ?? currentPackage.defaultTime,
        finish: "pendente",
        paid: "pendente",
      })
      toast.success("Sessão reposta no pacote e salva no servidor.")
      return true
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `Não foi possível adicionar a sessão: ${error.message}`
          : "Não foi possível adicionar a sessão."
      )
      return false
    }
  }

  function createPackageSessions(data: {
    packageId: string
    startDate: Date
    totalSessions: number
    fixedWeekDays: DayOfWeek[]
  }) {
    const sessions: Session[] = []
    let currentDate = getFirstPackageDate(data.startDate, data.fixedWeekDays)

    for (let index = 0; index < data.totalSessions; index++) {
      const sessionDate =
        index === 0
          ? currentDate
          : getNextPackageDate(currentDate, data.fixedWeekDays)

      sessions.push({
        id: crypto.randomUUID(),
        packageId: data.packageId,
        number: index + 1,
        date: sessionDate.toISOString(),
        finish: "pendente",
        paid: "pendente",
      })

      currentDate = sessionDate
    }

    return sessions
  }

  function getLastPackageSessionDate(packageId: string) {
    const packageSessions = patient.session.filter(
      (session) => session.packageId === packageId
    )

    const lastSession = packageSessions.sort((a, b) =>
      a.date.localeCompare(b.date)
    ).at(-1)

    return lastSession ? parseISO(lastSession.date) : new Date()
  }

  async function createNextPackage(data: {
    startDate: Date
    totalSessions: number
    valueSession: number
    fixedWeekDays: DayOfWeek[]
  }): Promise<boolean> {
    if (patient.typeService !== "Pacote" || !currentPackage) return false
    const hasPendingExtraSession = patient.session.some(
      (session) =>
        session.originPackageId === currentPackage.id &&
        session.isExtra &&
        session.finish !== "realizado"
    )
    if (hasPendingExtraSession) {
      toast.error(
        "Conclua a sessão avulsa extra antes de seguir com o próximo pacote."
      )
      return false
    }
    if (!Number.isInteger(data.totalSessions) || data.totalSessions < 1) {
      toast.error("Informe uma quantidade válida de sessões.")
      return false
    }
    if (data.fixedWeekDays.length === 0) {
      toast.error("Selecione ao menos um dia da semana para o pacote.")
      return false
    }
    if (!Number.isFinite(data.valueSession) || data.valueSession < 0) {
      toast.error("Informe um valor válido para a sessão.")
      return false
    }

    const newPackageId = crypto.randomUUID()

    const newPackageSessions = createPackageSessions({
      packageId: newPackageId,
      startDate: data.startDate,
      totalSessions: data.totalSessions,
      fixedWeekDays: data.fixedWeekDays,
    })

    try {
      const savedPackage = await createNextPackageTreatment({
        patientId: patient.id,
        previousTreatmentId: currentPackage.id,
        startDate: data.startDate,
        pricePerSession: data.valueSession,
        totalSessions: data.totalSessions,
        fixedWeekDays: data.fixedWeekDays,
        sessions: newPackageSessions.map((session) => ({
          date: parseISO(session.date),
          time: "16:00",
        })),
      })

      const newPackage = {
        id: savedPackage.id,
        startDate: data.startDate,
        totalSessions: data.totalSessions,
        migratedSessions: 0,
        valueSession: data.valueSession,
        fixedWeekDays: data.fixedWeekDays,
        defaultTime: "16:00",
        current: true,
      }
      const persistedSessions = newPackageSessions.map((session, index) => ({
        ...session,
        id: savedPackage.sessions[index].id,
        packageId: savedPackage.id,
        number: savedPackage.sessions[index].number,
        date: savedPackage.sessions[index].date,
        time: savedPackage.sessions[index].time,
      }))

      startNextPackage(
        patient.id,
        newPackage,
        persistedSessions,
        getLastPackageSessionDate(currentPackage.id)
      )
      toast.success("Novo pacote e sessões salvos no servidor.")
      return true
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `Não foi possível criar o pacote: ${error.message}`
          : "Não foi possível criar o pacote."
      )
      return false
    }
  }

  return {
    addSeparateSession,
    restoreMissingPackageSession,
    createNextPackage,
  }
}
