import { StatusSessaoKey } from "@/data/optionsSessionsData"
import { useFisioStore } from "@/store/fisio/fisioStore"
import { ListPatient, PaidKey } from "@/types"
import { toast } from "react-toastify"

type UseSessionStatusProps = {
  patient: ListPatient
  selectedSessions: string[]
}

export function useSessionStatus({
  patient,
  selectedSessions,
}: UseSessionStatusProps) {
  const changeSessionFinishInStore = useFisioStore(
    (state) => state.changeSessionFinish
  )
  const changeSessionPaymentInStore = useFisioStore(
    (state) => state.changeSessionPayment
  )
  const changeSessionsFinishInStore = useFisioStore(
    (state) => state.changeSessionsFinish
  )
  const changeSessionsPaymentInStore = useFisioStore(
    (state) => state.changeSessionsPayment
  )

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
    changeSessionsFinishInStore(patient.id, selectedSessions, value)
    toast.success("Status da sessão atualizado!")
  }

  function changePaymentStatus(value: PaidKey) {
    changeSessionsPaymentInStore(patient.id, selectedSessions, value)
    toast.success("Status do pagamento atualizado!")
  }

  function changeSessionFinish(sessionId: string, value: StatusSessaoKey) {
    changeSessionFinishInStore(patient.id, sessionId, value)
  }

  function changeSessionPayment(sessionId: string, value: PaidKey) {
    changeSessionPaymentInStore(patient.id, sessionId, value)
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
