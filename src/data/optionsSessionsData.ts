import { PaidKey } from "@/types"

export type StatusSessaoKey = "realizado" | "pendente" | "cancelado"

export interface StatusConfig {
  label: string
  value: StatusSessaoKey

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
    value: "realizado",

    button: {
      active: "bg-emerald-100 text-emerald-700",
      inactive: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
    },
  },

  pendente: {
    label: "Pendente",
    value: "pendente",

    button: {
      active: "bg-amber-100 text-amber-700",
      inactive: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
    },
  },
  cancelado: {
    label: "Cancelado",
    value: "cancelado",
    button: {
      active: "bg-slate-100 text-slate-700 border border-slate-300",
      inactive: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
    },
  },
} as const

export const pagamentoConfig: Record<PaidKey, PagamentoConfig> = {
  realizado: {
    label: "Realizado",
    value: "realizado",
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

  cancelado: {
    label: "Cancelado",
    className: "bg-slate-100 text-slate-700 border border-slate-300",
  },
}

export const statusPagamento: Record<StatusSessaoKey, StatusSessao> = {
  realizado: {
    label: "Realizado",
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
    value: "realizado",
    label: "Realizada",
    active: "bg-green-100 text-green-700 border-green-200",
    inactive: "bg-white border-[#EAECF0] text-[#667085]",
  },
  {
    value: "pendente",
    label: "Pendente",
    active: "bg-yellow-100 text-yellow-700 border-yellow-200",
    inactive: "bg-white border-[#EAECF0] text-[#667085]",
  },
]

export const paymentActions = [
  {
    value: "realizado",
    label: "Pago",
    active: "bg-green-100 text-green-700 border-green-200",
    inactive: "bg-white border-[#EAECF0] text-[#667085]",
  },
  {
    value: "cancelado",
    label: "Cancelada",
    active: "bg-red-100 text-red-600 border-red-200",
    inactive: "bg-white border-[#EAECF0] text-[#667085]",
  },
  {
    value: "pendente",
    label: "Pendente",
    active: "bg-sky-100 text-sky-700 border border-sky-200",
    inactive: "bg-white border-[#EAECF0] text-[#667085]",
  },
] satisfies {
  value: PaidKey
  label: string
  active: string
  inactive: string
}[]
