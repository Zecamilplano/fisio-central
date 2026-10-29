import type { StatusSessaoKey } from "@/data/optionsSessionsData"
import type { ListPatient, PaidKey, Session } from "@/types"
import type { StateCreator } from "zustand"
import type { FisioStore } from "../fisioStore"
import type { PatientId } from "./patientsSlice"

type SessionId = ListPatient["session"][number]["id"]

export type SessionsSlice = {
  changeSessionFinish: (
    patientId: PatientId,
    sessionId: SessionId,
    status: StatusSessaoKey
  ) => void
  changeSessionPayment: (
    patientId: PatientId,
    sessionId: SessionId,
    status: PaidKey
  ) => void
  changeSessionTime: (
    patientId: PatientId,
    sessionId: SessionId,
    time: string
  ) => void
  changeSessionsFinish: (
    patientId: PatientId,
    sessionIds: SessionId[],
    status: StatusSessaoKey
  ) => void
  changeSessionsPayment: (
    patientId: PatientId,
    sessionIds: SessionId[],
    status: PaidKey
  ) => void
  rescheduleSessions: (
    patientId: PatientId,
    updates: Array<{ id: SessionId; date: string }>
  ) => void
  addSession: (patientId: PatientId, session: Session) => void
  deleteSessions: (patientId: PatientId, sessionIds: SessionId[]) => void
}

function updateSessions(
  patients: ListPatient[],
  patientId: PatientId,
  sessionIds: SessionId[],
  update: (
    session: ListPatient["session"][number]
  ) => ListPatient["session"][number]
) {
  const selectedSessionIds = new Set(sessionIds)

  return patients.map((patient) =>
    patient.id === patientId
      ? {
          ...patient,
          session: patient.session.map((session) =>
            selectedSessionIds.has(session.id) ? update(session) : session
          ),
        }
      : patient
  )
}

export const createSessionsSlice: StateCreator<
  FisioStore,
  [],
  [],
  SessionsSlice
> = (set) => ({
  changeSessionFinish: (patientId, sessionId, status) =>
    set((state) => ({
      patients: updateSessions(
        state.patients,
        patientId,
        [sessionId],
        (session) => ({
          ...session,
          finish: status,
        })
      ),
    })),
  changeSessionPayment: (patientId, sessionId, status) =>
    set((state) => ({
      patients: updateSessions(
        state.patients,
        patientId,
        [sessionId],
        (session) => ({
          ...session,
          paid: status,
        })
      ),
    })),
  changeSessionTime: (patientId, sessionId, time) =>
    set((state) => ({
      patients: updateSessions(
        state.patients,
        patientId,
        [sessionId],
        (session) => ({ ...session, time })
      ),
    })),
  changeSessionsFinish: (patientId, sessionIds, status) =>
    set((state) => ({
      patients: updateSessions(
        state.patients,
        patientId,
        sessionIds,
        (session) => ({
          ...session,
          finish: status,
        })
      ),
    })),
  changeSessionsPayment: (patientId, sessionIds, status) =>
    set((state) => ({
      patients: updateSessions(
        state.patients,
        patientId,
        sessionIds,
        (session) => ({
          ...session,
          paid: status,
        })
      ),
    })),
  rescheduleSessions: (patientId, updates) =>
    set((state) => {
      const updatesById = new Map(
        updates.map((update): [string, string] => [update.id, update.date])
      )
      return {
        patients: state.patients.map((patient) =>
          patient.id === patientId
            ? {
                ...patient,
                session: patient.session.map((session) => {
                  const date = updatesById.get(session.id)
                  return date
                    ? {
                        ...session,
                        originalDate: session.originalDate ?? session.date,
                        date,
                      }
                    : session
                }),
              }
            : patient
        ),
      }
    }),
  addSession: (patientId, session) =>
    set((state) => ({
      patients: state.patients.map((patient) =>
        patient.id === patientId
          ? { ...patient, session: [...patient.session, session] }
          : patient
      ),
    })),
  deleteSessions: (patientId, sessionIds) =>
    set((state) => {
      const deletedSessionIds = new Set(sessionIds)

      return {
        patients: state.patients.map((patient) =>
          patient.id === patientId
            ? (() => {
                const remainingSessions = patient.session.filter(
                  (session) => !deletedSessionIds.has(session.id)
                )
                const sessionsByTreatment = new Map<string, Session[]>()

                for (const session of remainingSessions) {
                  const treatmentKey = session.packageId ?? "single-treatment"
                  const treatmentSessions =
                    sessionsByTreatment.get(treatmentKey) ?? []
                  treatmentSessions.push(session)
                  sessionsByTreatment.set(treatmentKey, treatmentSessions)
                }

                const renumberedSessions = [
                  ...sessionsByTreatment.values(),
                ].flatMap((treatmentSessions) =>
                  [...treatmentSessions]
                    .sort((a, b) => a.number - b.number)
                    .map((session, index) => ({
                      ...session,
                      number: index + 1,
                    }))
                )

                return { ...patient, session: renumberedSessions }
              })()
            : patient
        ),
      }
    }),
})
