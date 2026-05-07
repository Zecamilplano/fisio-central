import * as fn from "date-fns"
import { ptBR } from "date-fns/locale"
import { SchedulingErrorForm, SchedulingForm } from "@/types"

const currentDate = fn.format(new Date(), "dd/MM/yyyy")
const currentWeekDay = fn.format(new Date(), "EEEE", { locale: ptBR })

const TOTAL_SESSIONS = 6
const dayToIndex: Record<string, number> = {
  Domingo: 0,
  Segunda: 1,
  Terça: 2,
  Quarta: 3,
  Quinta: 4,
  Sexta: 5,
  Sábado: 6,
}

const schedulingFormData: SchedulingForm = {
  serviceType: "sessoes",
  package: {
    weeklyAmount: null,
    selectedDays: {},
    sessions: [],
    summary: [
      { label: "Agendadas", value: 0 },
      { label: "Restante", value: TOTAL_SESSIONS },
      { label: "Total", value: TOTAL_SESSIONS },
    ],
  },
  singleSession: null,
}

export const initialErrors: SchedulingErrorForm = {
  weeklyAmount: [],
  selectedDays: [],
  sessions: [],
  weekDay: [],
}

export {
  currentDate,
  currentWeekDay,
  TOTAL_SESSIONS,
  dayToIndex,
  schedulingFormData,
}
