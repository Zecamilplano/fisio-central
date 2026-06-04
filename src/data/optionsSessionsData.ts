import { PaidKey } from "@/types"
import { Check, Clock3, Wallet, LucideIcon } from "lucide-react"

export type StatusSessaoKey = "realizado" | "pendente"

export interface StatusConfig {
  label: string
  value: boolean
  Icon: LucideIcon

  button: {
    active: string
    inactive: string
  }
}

export interface PagamentoConfig {
  label: string
  value: PaidKey
  button: {
    active: string
    inactive: string
  }
}

type StatusSessao = {
  label: string
  className: string
}

export const statusConfig: Record<StatusSessaoKey, StatusConfig> = {
  realizado: {
    label: "Realizado",
    value: true,
    Icon: Check,

    button: {
      active: "bg-emerald-100 text-emerald-700",
      inactive: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
    },
  },

  pendente: {
    label: "Pendente",
    value: false,
    Icon: Clock3,

    button: {
      active: "bg-amber-100 text-amber-700",
      inactive: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
    },
  },
} as const

export const pagamentoConfig: Record<PaidKey, PagamentoConfig> = {
  pago: {
    label: "PAGO",
    value: "pago",
    button: {
      active: "bg-emerald-100 text-emerald-700",
      inactive: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
    },
  },

  pendente: {
    label: "Pendente",
    value: "pendente",
    button: {
      active: "bg-sky-100 text-sky-700 border border-sky-200",
      inactive: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
    },
  },

  cancelado: {
    label: "Cancelado",
    value: "cancelado",
    button: {
      active: "bg-red-100 text-red-700 border border-red-200",
      inactive: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
    },
  },
} as const

export const statusRealizacao: Record<StatusSessaoKey, StatusSessao> = {
  realizado: {
    label: "Realizado",
    className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  },

  pendente: {
    label: "Pendente",
    className: "bg-amber-100 text-amber-700 border border-amber-200",
  },
}

export const statusPagamento = {
  pago: {
    label: "Pago",
    className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  },

  pendente: {
    label: "Pendente",
    className: "bg-sky-100 text-sky-700 border border-sky-200",
  },

  cancelado: {
    label: "Cancelado",
    className: "bg-red-100 text-red-700 border border-red-200",
  },
}

export const sessionActions = [
  {
    id: "completed",
    label: "Marcar como Realizada",
    activeClass: "bg-green-100 text-green-700 border-green-200",
    inactive: "bg-white border-[#EAECF0] text-[#667085]",
  },
  {
    id: "pending",
    label: "Marcar como Pendente",
    activeClass: "bg-yellow-100 text-yellow-700 border-yellow-200",
    inactive: "bg-white border-[#EAECF0] text-[#667085]",
  },
]

export const paymentActions = [
  {
    id: "paid",
    label: "Marcar como Pago",
    activeClass: "bg-green-100 text-green-700 border-green-200",
    inactive: "bg-white border-[#EAECF0] text-[#667085]",
  },
  {
    id: "cancelled",
    label: "Marcar como Cancelada",
    activeClass: "bg-red-100 text-red-600 border-red-200",
    inactive: "bg-white border-[#EAECF0] text-[#667085]",
  },
  {
    id: "unpaid",
    label: "Marcar como Não Pago",
    activeClass: "bg-pink-100 text-pink-600 border-pink-200",
    inactive: "bg-white border-[#EAECF0] text-[#667085]",
  },
]
