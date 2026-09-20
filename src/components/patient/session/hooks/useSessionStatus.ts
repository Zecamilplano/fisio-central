import { StatusSessaoKey } from "@/data/optionsSessionsData"
import { ListPatient, PaidKey } from "@/types"
import React from "react"
import { toast } from "react-toastify"

type UseSessionStatusProps = {
  patient: ListPatient
  selectedSessions: string[]
  setListPatient: React.Dispatch<React.SetStateAction<ListPatient[]>>
}

export function useSessionStatus({
  patient,
  selectedSessions,
  setListPatient,
}: UseSessionStatusProps) {
  const selectedSessionItems = patient.session.filter((session) =>
    selectedSessions.includes(session.id)
  )

  const allFinished =
    selectedSessionItems.length > 0 &&
    selectedSessionItems.every((session) => session.finish === "realizado")

  const allPending =
    selectedSessionItems.length > 0 &&
    selectedSessionItems.every((session) => session.finish === "pendente")

  const allPaid =
    selectedSessionItems.length > 0 &&
    selectedSessionItems.every((session) => session.paid === "realizado")

  const allCancelled =
    selectedSessionItems.length > 0 &&
    selectedSessionItems.every((session) => session.paid === "cancelado")

  const allUnpaid =
    selectedSessionItems.length > 0 &&
    selectedSessionItems.every((session) => session.paid === "pendente")

  function changeFinishStatus(value: StatusSessaoKey) {
    setListPatient((prev) =>
      prev.map((item) => {
        if (item.id !== patient.id) return item

        return {
          ...item,
          session: item.session.map((session) =>
            selectedSessions.includes(session.id)
              ? { ...session, finish: value }
              : session
          ),
        }
      })
    )

    toast.success("Status da sessão atualizado!")
  }

  function changePaymentStatus(value: PaidKey) {
    setListPatient((prev) =>
      prev.map((item) => {
        if (item.id !== patient.id) return item

        return {
          ...item,
          session: item.session.map((session) =>
            selectedSessions.includes(session.id)
              ? { ...session, paid: value }
              : session
          ),
        }
      })
    )

    toast.success("Status do pagamento atualizado!")
  }

  function changeSessionFinish(sessionId: string, value: StatusSessaoKey) {
    setListPatient((prev) =>
      prev.map((item) => {
        if (item.id !== patient.id) return item

        return {
          ...item,
          session: item.session.map((session) =>
            session.id === sessionId ? { ...session, finish: value } : session
          ),
        }
      })
    )
  }

  function changeSessionPayment(sessionId: string, value: PaidKey) {
    setListPatient((prev) =>
      prev.map((item) => {
        if (item.id !== patient.id) return item

        return {
          ...item,
          session: item.session.map((session) =>
            session.id === sessionId ? { ...session, paid: value } : session
          ),
        }
      })
    )
  }

  const selectedActions = {
    finish: {
      markFinished: () => changeFinishStatus("realizado"),
      markPending: () => changeFinishStatus("pendente"),
      markCancelled: () => changeFinishStatus("cancelado"),
    },

    payment: {
      markPaid: () => changePaymentStatus("realizado"),
      markPending: () => changePaymentStatus("pendente"),
      markCancelled: () => changePaymentStatus("cancelado"),
    },
  }

  return {
    selectedSessionItems,

    selectedStatus: {
      finish: {
        allFinished,
        allPending,
        allCancelled,
      },
      payment: {
        allPaid,
        allPending,
        allCancelled,
        allUnpaid,
      },
    },
    selectedActions,

    changeFinishStatus,
    changePaymentStatus,
    changeSessionFinish,
    changeSessionPayment,
  }
}
