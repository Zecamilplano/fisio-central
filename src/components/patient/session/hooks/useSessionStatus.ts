import { StatusSessaoKey } from "@/data/optionsSessionsData"
import { useFisioStore } from "@/store/fisio/fisioStore"
import { ListPatient, PaidKey } from "@/types"
import { toast } from "react-toastify"
import { updateTreatmentSessions } from "@/services/patients/patientScheduleRepository"

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

  const allFinishCancelled =
    selectedSessionItems.length > 0 &&
    selectedSessionItems.every((session) => session.finish === "cancelado")

  const allPaymentCancelled =
    selectedSessionItems.length > 0 &&
    selectedSessionItems.every((session) => session.paid === "cancelado")

  const allUnpaid =
    selectedSessionItems.length > 0 &&
    selectedSessionItems.every((session) => session.paid === "pendente")

  async function changeFinishStatus(value: StatusSessaoKey) {
    try {
      await updateTreatmentSessions(selectedSessions, { finish_status: value })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar o status da sessão.")
      return
    }
    changeSessionsFinishInStore(patient.id, selectedSessions, value)
    toast.success("Status de realização salvo no servidor.", {
      toastId: "session-finish-status-saved",
    })
  }

  async function changePaymentStatus(value: PaidKey) {
    try {
      await updateTreatmentSessions(selectedSessions, { paid_status: value })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar o pagamento.")
      return
    }
    changeSessionsPaymentInStore(patient.id, selectedSessions, value)
    toast.success("Status de pagamento salvo no servidor.", {
      toastId: "session-payment-status-saved",
    })
  }

  async function changeSessionFinish(sessionId: string, value: StatusSessaoKey) {
    try {
      await updateTreatmentSessions([sessionId], { finish_status: value })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar o status da sessão.")
      return
    }
    changeSessionFinishInStore(patient.id, sessionId, value)
    toast.success("Status de realização salvo no servidor.", {
      toastId: "session-finish-status-saved",
    })
  }

  async function changeSessionPayment(sessionId: string, value: PaidKey) {
    try {
      await updateTreatmentSessions([sessionId], { paid_status: value })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar o pagamento.")
      return
    }
    changeSessionPaymentInStore(patient.id, sessionId, value)
    toast.success("Status de pagamento salvo no servidor.", {
      toastId: "session-payment-status-saved",
    })
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
        allCancelled: allFinishCancelled,
      },
      payment: {
        allPaid,
        allPending: allUnpaid,
        allCancelled: allPaymentCancelled,
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
