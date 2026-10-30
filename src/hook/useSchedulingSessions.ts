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
import { registerPatientLimits } from "@/data/registerPatientLimits"
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
  const [isSavingSchedule, setIsSavingSchedule] = useState(false)
  const [schedulingForm, setSchedulingForm] = useState<SchedulingForm>(() =>
    buildInitialSchedulingForm(totalSessions, serviceType)
  )

  const [schedulingFormErrors, setSchedulingFormErrors] =
    useState<SchedulingErrorForm>(initialErrors)

  useEffect(() => {
    const isPersistentError = (message: string) =>
      message === "Informe a data inicial do pacote." ||
      message === "Informe o horário das sessões." ||
      message === "Informe o horário da sessão." ||
      message === "Selecione a data inicial do pacote." ||
      message === "Selecione quantas vezes na semana." ||
      message === "Selecione a quantidade de dias definida para a semana." ||
      message === "Selecione a mesma quantidade de dias definida para a semana." ||
      message === "Selecione uma data para a sessão." ||
      message === "Selecione um dia para a sessão." ||
      /^Gere as \d+ sessões restantes antes de cadastrar\.$/.test(message) ||
      message === "Remova as sessões excedentes antes de cadastrar."
    const hasTransientError = Object.values(schedulingFormErrors).some(
      (messages) => messages.some((message) => !isPersistentError(message))
    )
    if (!hasTransientError) return

    const errorSnapshot = schedulingFormErrors
    const timer = setTimeout(() => {
      setSchedulingFormErrors((current) => {
        const next = { ...current }
        for (const field of Object.keys(errorSnapshot) as (keyof SchedulingErrorForm)[]) {
          if (
            current[field] === errorSnapshot[field] &&
            !errorSnapshot[field].some(isPersistentError)
          ) {
            next[field] = []
          } else if (current[field] === errorSnapshot[field]) {
            next[field] = current[field].filter(isPersistentError)
          }
        }
        return next
      })
    }, 5000)

    return () => clearTimeout(timer)
  }, [schedulingFormErrors])

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
      const hasDraft =
        schedulingForm.serviceType !== null ||
        schedulingForm.totalSessions !== null ||
        schedulingForm.initialDateSession !== null ||
        schedulingForm.package.startDate !== null ||
        schedulingForm.package.sessions.length > 0 ||
        schedulingForm.singleSession !== null

      if (hasDraft) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(schedulingForm))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      console.error("Erro ao salvar no localStorage.")
    }
  }, [schedulingForm])

  function resetScheduling(nextServiceType: TypeServiceType | null = null) {
    setSchedulingForm(buildInitialSchedulingForm(0, nextServiceType))
    setSchedulingFormErrors(initialErrors)
    setIsHalfPaymentModalOpen(false)
    setIsSavingSchedule(false)
  }

  function validateBeforeSubmit(): boolean {
    const errors: SchedulingErrorForm = {
      totalSessions: [],
      startDate: [],
      defaultTime: [],
      paymentType: [],
      weeklyAmount: [],
      selectedDays: [],
      sessions: [],
      weekDay: [],
    }

    const previousSessions = schedulingForm.totalSessions
    if (previousSessions !== null && (!Number.isInteger(previousSessions) || previousSessions < 0 || previousSessions > registerPatientLimits.sessionsAlreadyCompleted)) {
      errors.totalSessions.push(`Use um número inteiro entre 0 e ${registerPatientLimits.sessionsAlreadyCompleted}.`)
    }

    if (schedulingForm.serviceType === "pacote") {
      const packageForm = schedulingForm.package
      const selectedWeekDays = Object.keys(packageForm.selectedDays).filter(
        (day) => packageForm.selectedDays[day]
      )

      if (!packageForm.startDate) {
        errors.startDate.push("Informe a data inicial do pacote.")
      }
      if (!packageForm.defaultTime.trim()) {
        errors.defaultTime.push("Informe o horário das sessões.")
      }
      if (!packageForm.weeklyAmount) {
        errors.weeklyAmount.push("Selecione quantas vezes na semana.")
      }
      if (
        !packageForm.weeklyAmount ||
        selectedWeekDays.length !== packageForm.weeklyAmount
      ) {
        errors.selectedDays.push(
          "Selecione a quantidade de dias definida para a semana."
        )
      }
      if (packageForm.sessions.length !== totalSessions) {
        const remainingSessions = totalSessions - packageForm.sessions.length
        errors.sessions.push(
          remainingSessions > 0
            ? `Gere as ${remainingSessions} sessões restantes antes de cadastrar.`
            : "Remova as sessões excedentes antes de cadastrar."
        )
      }
    } else if (schedulingForm.serviceType === "sessoes") {
      if (!schedulingForm.singleSession?.fullDate) {
        errors.weekDay.push("Selecione uma data para a sessão.")
      }
      if (!schedulingForm.singleSession?.time.trim()) {
        errors.defaultTime.push("Informe o horário da sessão.")
      }
    } else {
      errors.sessions.push("Selecione o tipo de atendimento novamente.")
    }

    setSchedulingFormErrors(errors)
    return Object.values(errors).every((fieldErrors) => fieldErrors.length === 0)
  }

  function validateSchedulingForm(form: SchedulingForm): boolean {
    if (form.serviceType === "sessoes") {
      return (
        form.singleSession !== null &&
        form.singleSession.fullDate !== null &&
        form.singleSession.time.trim() !== "" &&
        (form.totalSessions === null || (Number.isInteger(form.totalSessions) && form.totalSessions >= 0 && form.totalSessions <= registerPatientLimits.sessionsAlreadyCompleted))
      )
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
        sessions.length === totalSessions &&
        (form.totalSessions === null || (Number.isInteger(form.totalSessions) && form.totalSessions >= 0 && form.totalSessions <= registerPatientLimits.sessionsAlreadyCompleted))
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
      totalSessions: [],
      startDate: [],
      defaultTime: [],
      paymentType: [],

      weeklyAmount: [],
      selectedDays: [],
      sessions: [],
      weekDay: [],
    }

    const previousSessions = schedulingForm.totalSessions
    if (previousSessions !== null && (!Number.isInteger(previousSessions) || previousSessions < 0 || previousSessions > registerPatientLimits.sessionsAlreadyCompleted)) {
      newErrors.totalSessions.push(`Use um número inteiro entre 0 e ${registerPatientLimits.sessionsAlreadyCompleted}.`)
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
    if (weeklyAmount && activeDays.length !== weeklyAmount) {
      newErrors.selectedDays.push(
        "Selecione a mesma quantidade de dias definida para a semana."
      )
    }
    if (scheduledCount >= totalSessions) {
      newErrors.sessions.push("Limite de sessões atingido.")
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
    setSchedulingFormErrors((prev) => ({ ...prev, sessions: [] }))
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

    setSchedulingFormErrors((prev) => ({ ...prev, weekDay: [], defaultTime: [] }))
  }

  function handleDateClear() {
    setSchedulingForm((prev) => ({
      ...prev,
      singleSession: null,
    }))
  }

  function updateSingleSession(
    fields: Partial<
      Pick<NonNullable<SchedulingForm["singleSession"]>, "time" | "finish" | "paid">
    >
  ) {
    setSchedulingForm((prev) =>
      prev.singleSession
        ? { ...prev, singleSession: { ...prev.singleSession, ...fields } }
        : prev
    )
    if (fields.time?.trim()) {
      setSchedulingFormErrors((prev) => ({ ...prev, defaultTime: [] }))
    }
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
    totalSessions: (sessions: number | string) => {
      const enteredValue = sessions === "" ? null : Number(sessions)
      const invalidInteger = enteredValue !== null && !Number.isInteger(enteredValue)
      const exceededLimit = enteredValue !== null && enteredValue > registerPatientLimits.sessionsAlreadyCompleted
      const belowMinimum = enteredValue !== null && enteredValue < 0
      const value = exceededLimit
        ? registerPatientLimits.sessionsAlreadyCompleted
        : belowMinimum
          ? 0
          : enteredValue
      setSchedulingForm((prev) => ({
        ...prev,
        totalSessions: invalidInteger ? prev.totalSessions : value,
      }))
      setSchedulingFormErrors((prev) => ({
        ...prev,
        totalSessions: exceededLimit
          ? [`Limite de ${registerPatientLimits.sessionsAlreadyCompleted} sessões atingido.`]
          : invalidInteger
            ? ["Informe uma quantidade inteira de sessões."]
            : belowMinimum
              ? ["A quantidade de sessões não pode ser negativa."]
              : value !== null && (!Number.isInteger(value) || value < 0)
            ? [`Use um número inteiro entre 0 e ${registerPatientLimits.sessionsAlreadyCompleted}.`]
            : [],
      }))
    },
    "package.startDate": (startDate: Date) => {
      setSchedulingForm((prev) => ({
        ...prev,
        package: { ...prev.package, startDate },
      }))
      setSchedulingFormErrors((prev) => ({ ...prev, startDate: [] }))
    },
    "package.defaultTime": (defaultTime: string) => {
      setSchedulingForm((prev) => ({
        ...prev,
        package: { ...prev.package, defaultTime },
      }))
      setSchedulingFormErrors((prev) => ({ ...prev, defaultTime: [] }))
    },
    "package.summary.weeklyAmount": handleWeeklyAmount,
    "package.summary.selectedDays": handleDayToggle,
    "package.paymentType": handlePaymentType,
    handleDeleteSession,
    updateSessionStatus,
    updateSessionSchedule,
    handleAddSessions,
    handleDateChange,
    updateSingleSession,
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
    isSavingSchedule,
    setIsSavingSchedule,
    validateBeforeSubmit,
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
    updateSingleSession,
    handleValidateSingleSession,
    resetScheduling,
  }
}
