import type { DayOfWeek, ListPatient, Session, TreatmentPackage } from "@/types"
import { useFisioStore } from "@/store/fisio/fisioStore"
import { parseISO } from "date-fns"
import {
  addSingleTreatmentSession,
  addStandaloneSessionToPatient,
  createNextPackageTreatment,
  restoreMissingPackageSessionsWithSchedule,
} from "@/services/patients/patientScheduleRepository"
import { toast } from "react-toastify"

type UseSessionCreationProps = {
  patient: ListPatient
  currentPackage: TreatmentPackage | null
  getNextPackageDate: (lastDate: Date, fixedWeekDays: DayOfWeek[]) => Date
  getFirstPackageDate: (startDate: Date, fixedWeekDays: DayOfWeek[]) => Date
}

export function useSessionCreation({
  patient,
  currentPackage,
  getNextPackageDate,
  getFirstPackageDate,
}: UseSessionCreationProps) {
  const addSession = useFisioStore((state) => state.addSession)
  const updatePackageSchedule = useFisioStore(
    (state) => state.updatePackageSchedule
  )
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
    schedule?: {
      startDate: Date
      time: string
      fixedWeekDays: DayOfWeek[]
    }
  ): Promise<boolean> {
    if (patient.typeService !== "Pacote" || !currentPackage) return false
    if (!schedule || !Number.isFinite(schedule.startDate.getTime())) {
      toast.error("Informe uma data inicial válida para o pacote.")
      return false
    }
    if (schedule.fixedWeekDays.length === 0) {
      toast.error("Selecione ao menos um dia da semana para o pacote.")
      return false
    }
    if (!schedule.time.trim()) {
      toast.error("Informe o horário da sessão.")
      return false
    }

    try {
      const savedSessions = await restoreMissingPackageSessionsWithSchedule(
        currentPackage.id,
        schedule.startDate,
        schedule.time,
        schedule.fixedWeekDays
      )
      updatePackageSchedule(
        patient.id,
        currentPackage.id,
        schedule.startDate,
        schedule.fixedWeekDays
      )
      savedSessions.forEach((saved) => {
        addSession(patient.id, {
          id: saved.id,
          number: saved.number,
          packageId: currentPackage.id,
          date: saved.date,
          time: saved.time,
          finish: "pendente",
          paid: "pendente",
        })
      })
      toast.success(
        savedSessions.length === 1
          ? "Pacote reposto com 1 sessão e salvo no servidor."
          : `Pacote reposto com ${savedSessions.length} sessões e salvo no servidor.`
      )
      return true
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `Não foi possível repor o pacote: ${error.message}`
          : "Não foi possível repor o pacote."
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
