import { useEffect, useMemo, useState } from "react"
import {
  Package,
  PaymentType,
  SchedulingErrorForm,
  SchedulingForm,
  Session_,
  TypeServiceType,
} from "@/types"
import { initialErrors } from "@/data/schedulingData"
import {
  applyPaymentToSessions,
  buildSessions,
  getLastDate,
} from "@/utils/form"

const STORAGE_KEY = "schedulingForm"

function buildInitialSchedulingForm(
  totalSessions: number,
  serviceType: TypeServiceType | null = null
): SchedulingForm {
  return {
    serviceType,
    totalSessions: null,
    initialDateSession: null,
    package: {
      startDate: null,
      defaultTime: "16:00",
      paymentType: "metade",
      paidSessionsCount: null,

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
  const [isHalfPaymentModalOpen, setIsHalfPaymentModalOpen] = useState(false)
  const [schedulingForm, setSchedulingForm] = useState<SchedulingForm>(() =>
    buildInitialSchedulingForm(totalSessions, serviceType)
  )

  const [schedulingFormErrors, setSchedulingFormErrors] =
    useState<SchedulingErrorForm>(initialErrors)

  const {
    startDate,
    defaultTime,
    paymentType,
    weeklyAmount,
    selectedDays,
    sessions,
    summary,
  } = schedulingForm.package
  const activeDays = Object.keys(selectedDays).filter((d) => selectedDays[d])
  const scheduledCount = sessions.length
  const maxDaysReached =
    weeklyAmount !== null && activeDays.length >= weeklyAmount

  useEffect(() => {
    const initial = buildInitialSchedulingForm(totalSessions, serviceType)

    try {
      const stored = localStorage.getItem(STORAGE_KEY)

      if (!stored) {
        setSchedulingForm(initial)
        return
      }

      const parsed = JSON.parse(stored)
      const savedTotalSessions = parsed.package?.summary?.find(
        (item: { label: string }) => item.label === "Total"
      )?.value
      const packageQuantityChanged =
        typeof savedTotalSessions === "number" &&
        savedTotalSessions !== totalSessions
      const restoredSessions = packageQuantityChanged
        ? []
        : (parsed.package?.sessions ?? [])

      setSchedulingForm({
        ...initial,
        ...parsed,
        serviceType,
        package: {
          ...initial.package,
          ...parsed.package,
          sessions: restoredSessions,
          paidSessionsCount: packageQuantityChanged
            ? null
            : (parsed.package?.paidSessionsCount ?? null),
          summary: [
            {
              label: "Agendadas",
              value: restoredSessions.length,
            },
            {
              label: "Restante",
              value: totalSessions - restoredSessions.length,
            },
            { label: "Total", value: totalSessions },
          ],
        },
      })
    } catch {
      setSchedulingForm(initial)
    }
  }, [serviceType, totalSessions])

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
      const { startDate, defaultTime, weeklyAmount, selectedDays, sessions } =
        form.package
      const activeDays = Object.keys(selectedDays).filter(
        (d) => selectedDays[d]
      )
      return (
        startDate !== null &&
        defaultTime.trim() !== "" &&
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
      startDate: [],
      defaultTime: [],
      paymentType: [],

      weeklyAmount: [],
      selectedDays: [],
      sessions: [],
      weekDay: [],
    }

    if (!startDate) {
      newErrors.startDate.push("Selecione a data inicial do pacote.")
    }

    if (!defaultTime.trim()) {
      newErrors.defaultTime.push("Informe o horário das sessões.")
    }

    if (!weeklyAmount) {
      newErrors.weeklyAmount.push("Selecione quantas vezes na semana.")
    }
    if (activeDays.length !== weeklyAmount) {
      newErrors.selectedDays.push(
        "Selecione a mesma quantidade de dias definida para a semana."
      )
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

    if (
      paymentType === "metade" &&
      schedulingForm.package.paidSessionsCount == null
    ) {
      setIsHalfPaymentModalOpen(true)
      return
    }

    const lastDate = getLastDate(sessions)
    const firstSessionDate = lastDate ?? startDate

    if (!firstSessionDate) return

    const newSessions = buildSessions(
      activeDays,
      scheduledCount,
      firstSessionDate,
      totalSessions,
      defaultTime,
      paymentType,
      schedulingForm.package.paidSessionsCount ?? Math.floor(totalSessions / 2)
    )

    updatePackage({ sessions: [...sessions, ...newSessions] })
  }

  function handleDeleteSession(index: number) {
    const updatedSessions = sessions
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, sessionNumber: i + 1 }))

    updatePackage({ sessions: updatedSessions })
  }

  function handleClearSessions() {
    updatePackage({
      sessions: [],
      ...(paymentType === "metade" ? { paidSessionsCount: null } : {}),
    })
    setSchedulingFormErrors((prev) => ({ ...prev, sessions: [] }))
  }

  function updateSessionStatus(
    index: number,
    fields: Partial<Pick<Session_, "finish" | "paid">>
  ) {
    updatePackage({
      sessions: sessions.map((session, sessionIndex) =>
        sessionIndex === index ? { ...session, ...fields } : session
      ),
    })
  }

  function updateSessionSchedule(
    index: number,
    fields: Partial<Pick<Session_, "fullDate" | "weekDay" | "time">>
  ) {
    updatePackage({
      sessions: sessions.map((session, sessionIndex) =>
        sessionIndex === index ? { ...session, ...fields } : session
      ),
    })
  }

  function handleDateChange(date: Date) {
    setSchedulingForm((prev) => ({
      ...prev,
      singleSession: {
        fullDate: date,
        weekDay: date.toLocaleDateString("pt-BR", { weekday: "long" }),
        time: "16:00",
        paid: "pendente",
        finish: "pendente",
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

  function handlePaymentType(paymentType: PaymentType) {
    if (paymentType === "metade") {
      setSchedulingForm((prev) => ({
        ...prev,
        package: {
          ...prev.package,
          paymentType,
          paidSessionsCount: null,
        },
      }))
      setIsHalfPaymentModalOpen(true)
      return
    }

    const paidSessionsCount = null

    setSchedulingForm((prev) => ({
      ...prev,
      package: {
        ...prev.package,
        paymentType,
        paidSessionsCount,
        sessions: applyPaymentToSessions(
          prev.package.sessions,
          paymentType,
          paidSessionsCount ?? undefined
        ),
      },
    }))
    setIsHalfPaymentModalOpen(false)
  }

  function handleHalfPaymentChoice(paidSessionsCount: number) {
    setSchedulingForm((prev) => ({
      ...prev,
      package: {
        ...prev.package,
        paymentType: "metade",
        paidSessionsCount,
        sessions: applyPaymentToSessions(
          prev.package.sessions,
          "metade",
          paidSessionsCount
        ),
      },
    }))
    setIsHalfPaymentModalOpen(false)
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

  const handlers = {
    initialDateSession: (date: Date) =>
      setSchedulingForm((prev) => ({
        ...prev,
        initialDateSession: date ?? null,
      })),
    totalSessions: (sessions: number) =>
      setSchedulingForm((prev) => ({
        ...prev,
        totalSessions: sessions ?? null,
      })),
    "package.startDate": (startDate: Date) =>
      setSchedulingForm((prev) => ({
        ...prev,
        package: { ...prev.package, startDate: startDate },
      })),
    "package.defaultTime": (defaultTime: string) =>
      setSchedulingForm((prev) => ({
        ...prev,
        package: { ...prev.package, defaultTime },
      })),
    "package.summary.weeklyAmount": handleWeeklyAmount,
    "package.summary.selectedDays": handleDayToggle,
    "package.paymentType": handlePaymentType,
    handleDeleteSession,
    updateSessionStatus,
    updateSessionSchedule,
    handleAddSessions,
    handleDateChange,
  }

  function handleChange(field: keyof typeof handlers, value?: any) {
    const handler = handlers[field as keyof typeof handlers]

    if (!handler) return
    ;(handler as (value?: any) => void)(value)
  }

  return {
    // estado
    summary,
    sessions,
    totalSessions,
    isHalfPaymentModalOpen,
    setIsHalfPaymentModalOpen,
    handleHalfPaymentChoice,
    weeklyAmount,
    selectedDays,
    scheduledCount,
    maxDaysReached,
    schedulingForm,
    setSchedulingForm,
    schedulingFormErrors,
    isSchedulingFormValid,
    // handlers
    handleChange,
    handleWeeklyAmount,
    handleDayToggle,
    handleAddSessions,
    handleDeleteSession,
    handleClearSessions,
    updateSessionStatus,
    updateSessionSchedule,
    handleDateChange,
    handleDateClear,
    handleValidateSingleSession,
  }
}
