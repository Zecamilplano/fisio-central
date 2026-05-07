import { useEffect, useMemo, useState } from "react"
import {
  Package,
  SchedulingErrorForm,
  SchedulingForm,
  TypeServiceType,
} from "@/types"
import {
  schedulingFormData,
  initialErrors,
  TOTAL_SESSIONS,
} from "@/data/schedulingData"
import { buildSessions, getLastDate } from "@/utils/form"

const STORAGE_KEY = "schedulingForm"

function buildInitialSchedulingForm(
  totalSessions: number,
  serviceType: TypeServiceType | null = null
): SchedulingForm {
  return {
    serviceType: serviceType,
    package: {
      totalSessions: null,
      weeklyAmount: null,
      selectedDays: {},
      sessions: [],
      summary: [
        { label: "Agendadas", value: 0 },
        { label: "Restante", value: totalSessions },
        { label: "Total", value: totalSessions },
      ],
    },
    singleSession: null,
  }
}

export function useSchedulingSessions(
  totalSessions: number,
  serviceType: TypeServiceType | null = null
) {
  const [schedulingForm, setSchedulingForm] = useState<SchedulingForm>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          ...parsed,
          serviceType: serviceType,
          package: {
            ...parsed.package,
            summary: [
              { label: "Agendadas", value: parsed.package.sessions.length },
              {
                label: "Restante",
                value: totalSessions - parsed.package.sessions.length,
              },
              { label: "Total", value: totalSessions },
            ],
          },
        }
      }
      return buildInitialSchedulingForm(totalSessions)
    } catch {
      return buildInitialSchedulingForm(totalSessions)
    }
  })

  const [schedulingFormErrors, setSchedulingFormErrors] =
    useState<SchedulingErrorForm>(initialErrors)

  const { weeklyAmount, selectedDays, sessions, summary } =
    schedulingForm.package
  const activeDays = Object.keys(selectedDays).filter((d) => selectedDays[d])
  const scheduledCount = sessions.length
  const maxDaysReached =
    weeklyAmount !== null && activeDays.length >= weeklyAmount

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schedulingForm))
    } catch {
      console.error("Erro ao salvar no localStorage.")
    }
  }, [schedulingForm])

  function validateSchedulingForm(form: SchedulingForm): boolean {
    if (form.serviceType === "sessoes") {
      return form.singleSession !== null && form.singleSession.fullDate !== null
    }

    if (form.serviceType === "pacote") {
      const { weeklyAmount, selectedDays, sessions } = form.package
      const activeDays = Object.keys(selectedDays).filter(
        (d) => selectedDays[d]
      )
      return (
        weeklyAmount !== null &&
        activeDays.length > 0 &&
        sessions.length === totalSessions
      )
    }

    return false
  }

  const isSchedulingFormValid = useMemo(() => {
    const validate = validateSchedulingForm(schedulingForm)
    return validate
  }, [schedulingForm])

  // ─── Update ───────────────────────────────────────────────────
  function updatePackage(fields: Partial<Package>) {
    setSchedulingForm((prev) => {
      const updatedSessions = fields.sessions ?? prev.package.sessions
      const scheduled = updatedSessions.length
      const remaining = totalSessions - scheduled

      return {
        ...prev,
        package: {
          ...prev.package,
          ...fields,
          summary: [
            { label: "Agendadas", value: scheduled },
            { label: "Restante", value: remaining },
            { label: "Total", value: totalSessions },
          ],
        },
      }
    })
  }

  // ─── Handlers ─────────────────────────────────────────────────
  function handleWeeklyAmount(value: number) {
    updatePackage({ weeklyAmount: value })
    setSchedulingFormErrors((prev) => ({ ...prev, weeklyAmount: [] }))
  }

  function handleDayToggle(day: string) {
    updatePackage({
      selectedDays: { ...selectedDays, [day]: !selectedDays[day] },
    })
    setSchedulingFormErrors((prev) => ({ ...prev, selectedDays: [] }))
  }

  function clearError() {
    // setTimeout(() => setSchedulingFormErrors(initialErrors), 3000)
  }

  function handleAddSessions() {
    const newErrors: SchedulingErrorForm = {
      weeklyAmount: [],
      selectedDays: [],
      sessions: [],
      weekDay: [],
    }

    if (!weeklyAmount) {
      newErrors.weeklyAmount.push("Selecione quantas vezes na semana.")
    }
    if (activeDays.length === 0) {
      newErrors.selectedDays.push("Selecione pelo menos um dia da semana.")
    }
    if (scheduledCount >= totalSessions) {
      newErrors.sessions.push("Limite de sessões atingido.")
      setSchedulingFormErrors(newErrors)

      setTimeout(() => {
        setSchedulingFormErrors((prev) => ({ ...prev, sessions: [] }))
      }, 3000)
    }

    const hasErrors = Object.values(newErrors).some((e) => e.length > 0)

    if (hasErrors) {
      setSchedulingFormErrors(newErrors)
      clearError()
      return
    }

    const lastDate = getLastDate(sessions)
    const newSessions = buildSessions(
      activeDays,
      scheduledCount,
      lastDate,
      totalSessions
    )

    updatePackage({ sessions: [...sessions, ...newSessions] })
  }

  function handleDeleteSession(index: number) {
    const updatedSessions = sessions
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, sessionNumber: i + 1 }))

    updatePackage({ sessions: updatedSessions })
  }

  function handleDateChange(date: Date) {
    setSchedulingForm((prev) => ({
      ...prev,
      singleSession: {
        fullDate: date,
        weekDay: date.toLocaleDateString("pt-BR", { weekday: "long" }),
      },
    }))

    setSchedulingFormErrors((prev) => ({ ...prev, weekDay: [] }))
  }

  function handleDateClear() {
    setSchedulingForm((prev) => ({
      ...prev,
      singleSession: null,
    }))
  }

  function handleValidateSingleSession() {
    const newErrors = { ...schedulingFormErrors }

    if (!schedulingForm.singleSession) {
      newErrors.weekDay = ["Selecione um dia para a sessão."]
    } else {
      newErrors.weekDay = []
    }

    setSchedulingFormErrors(newErrors)
    clearError()
  }

  return {
    // estado
    summary,
    sessions,
    weeklyAmount,
    selectedDays,
    scheduledCount,
    maxDaysReached,
    schedulingForm,
    setSchedulingForm,
    schedulingFormErrors,
    isSchedulingFormValid,
    // handlers
    handleWeeklyAmount,
    handleDayToggle,
    handleAddSessions,
    handleDeleteSession,
    handleDateChange,
    handleDateClear,
    handleValidateSingleSession,
  }
}
