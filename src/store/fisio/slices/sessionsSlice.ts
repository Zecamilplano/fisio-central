import type { StatusSessaoKey } from "@/data/optionsSessionsData"
import type { DayOfWeek, ListPatient, PaidKey, Session } from "@/types"
import { addDays, format, getDay, parseISO } from "date-fns"
import type { StateCreator } from "zustand"
import type { FisioStore } from "../fisioStore"
import type { PatientId } from "./patientsSlice"

type SessionId = ListPatient["session"][number]["id"]

const weekDayMap = {
  Domingo: 0,
  Segunda: 1,
  Terça: 2,
  Quarta: 3,
  Quinta: 4,
  Sexta: 5,
  Sábado: 6,
} as const

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
  rescheduleSession: (
    patientId: PatientId,
    sessionId: SessionId,
    date: string
  ) => void
  addSession: (patientId: PatientId, session: Session) => void
  deleteSessions: (patientId: PatientId, sessionIds: SessionId[]) => void
}

function getNextPackageDate(lastDate: Date, fixedWeekDays: DayOfWeek[]) {
  const allowedDays: number[] = fixedWeekDays.map((day) => weekDayMap[day])
  let nextDate = addDays(lastDate, 1)

  while (!allowedDays.includes(getDay(nextDate))) {
    nextDate = addDays(nextDate, 1)
  }

  return nextDate
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
  rescheduleSession: (patientId, sessionId, date) =>
    set((state) => ({
      patients: state.patients.map((patient) => {
        if (patient.id !== patientId) return patient

        const changedSession = patient.session.find(
          (session) => session.id === sessionId
        )

        if (!changedSession) return patient

        if (!changedSession.packageId) {
          return {
            ...patient,
            session: patient.session.map((session) =>
              session.id === sessionId ? { ...session, date } : session
            ),
          }
        }

        if (patient.typeService !== "Pacote") return patient

        const treatmentPackage = patient.packages.find(
          (item) => item.id === changedSession.packageId
        )
        if (!treatmentPackage) return patient

        const packageSessions = patient.session
          .filter((session) => session.packageId === changedSession.packageId)
          .sort((a, b) => a.number - b.number)
        const changedIndex = packageSessions.findIndex(
          (session) => session.id === sessionId
        )
        if (changedIndex === -1) return patient

        const updatedPackageSessions = packageSessions.slice(0, changedIndex)
        let previousDate = parseISO(date)

        updatedPackageSessions.push({
          ...packageSessions[changedIndex],
          date,
        })

        for (
          let index = changedIndex + 1;
          index < packageSessions.length;
          index++
        ) {
          const session = packageSessions[index]
          const nextDate = getNextPackageDate(
            previousDate,
            treatmentPackage.fixedWeekDays
          )

          updatedPackageSessions.push({
            ...session,
            date: format(nextDate, "yyyy-MM-dd"),
          })
          previousDate = nextDate
        }

        return {
          ...patient,
          session: [
            ...patient.session.filter(
              (session) => session.packageId !== changedSession.packageId
            ),
            ...updatedPackageSessions,
          ],
        }
      }),
    })),
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
            ? {
                ...patient,
                session: patient.session
                  .filter((session) => !deletedSessionIds.has(session.id))
                  .map((session, index) => ({
                    ...session,
                    number: index + 1,
                  })),
              }
            : patient
        ),
      }
    }),
})
