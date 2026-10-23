import { StatusSessaoKey } from "@/data/optionsSessionsData"
import { useFisioStore } from "@/store/fisio/fisioStore"
import { ListPatient, PaidKey } from "@/types"
import { toast } from "react-toastify"
import { updateSingleTreatmentSessions } from "@/services/patients/patientScheduleRepository"

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

  async function changeFinishStatus(value: StatusSessaoKey) {
    if (patient.typeService === "Sessão avulsa") {
      try {
        await updateSingleTreatmentSessions(selectedSessions, {
          finish_status: value,
        })
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao salvar o status da sessão.")
        return
      }
    }
    changeSessionsFinishInStore(patient.id, selectedSessions, value)
    toast.success("Status da sessão atualizado!")
  }

  async function changePaymentStatus(value: PaidKey) {
    if (patient.typeService === "Sessão avulsa") {
      try {
        await updateSingleTreatmentSessions(selectedSessions, {
          paid_status: value,
        })
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao salvar o pagamento.")
        return
      }
    }
    changeSessionsPaymentInStore(patient.id, selectedSessions, value)
    toast.success("Status do pagamento atualizado!")
  }

  async function changeSessionFinish(sessionId: string, value: StatusSessaoKey) {
    if (patient.typeService === "Sessão avulsa") {
      try {
        await updateSingleTreatmentSessions([sessionId], { finish_status: value })
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao salvar o status da sessão.")
        return
      }
    }
    changeSessionFinishInStore(patient.id, sessionId, value)
  }

  async function changeSessionPayment(sessionId: string, value: PaidKey) {
    if (patient.typeService === "Sessão avulsa") {
      try {
        await updateSingleTreatmentSessions([sessionId], { paid_status: value })
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao salvar o pagamento.")
        return
      }
    }
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
