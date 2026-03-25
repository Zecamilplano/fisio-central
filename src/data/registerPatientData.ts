import {
  typeOfServiceDataType,
  stepDataType,
  summaryCardType,
  totalNumberSessionType,
} from "@/types/patientsTypes"
import { Box, CalendarDays } from "lucide-react"

export const optionsTypeServiceData: typeOfServiceDataType[] = [
  {
    value: "pacote",
    titulo: "Pacote",
    descricao: "Conjunto de sessões com valor fechado",
    Icone: Box,
  },
  {
    value: "sessoes",
    titulo: "Sessões",
    descricao: "Agende sessões individuais conforme necessário",
    Icone: CalendarDays,
  },
]

export const stepData: Record<string, stepDataType> = {
  firstStep: {
    active: false,
    completed: false,
  },
  secondStep: {
    active: false,
    completed: false,
  },
  thirdStep: {
    active: true,
    completed: false,
  },
}

export let totalNumberSession: totalNumberSessionType[] = [
  { label: 4, value: 4 },
  { label: 6, value: 6 },
  { label: 8, value: 8 },
  { label: 10, value: 10 },
  { label: "+", value: "custom" },
]

export const summaryCardData: summaryCardType[] = [
  {
    value: 0,
    label: "Agendada",
  },
  {
    value: 6,
    label: "Restante",
  },
  {
    value: 6,
    label: "Total",
  },
]

export const daysOfTheWeek = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]
