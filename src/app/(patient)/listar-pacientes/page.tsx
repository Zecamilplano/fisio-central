"use client"
import { PatientDetails } from "@/components/patient/list/patientDetails"
import {
  PatientSidebar,
  SubHeaderPatientList,
  PatientEmptyState,
} from "@/components/patient/list"
import { useFisioStore } from "@/store/fisio/fisioStore"
import { getPatientsForList } from "@/services/patients/patientListRepository"
import { getSessionEvolutions } from "@/services/patients/sessionEvolutionRepository"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"

type PatientHistoryState = {
  __fisioPatientDetailEntry?: boolean
  __fisioPatientListBase?: boolean
  [key: string]: unknown
}

function getHistoryState(): PatientHistoryState {
  const state: unknown = window.history.state
  return state && typeof state === "object"
    ? (state as PatientHistoryState)
    : {}
}

function getRelativeUrl(url: URL) {
  return `${url.pathname}${url.search}${url.hash}`
}

function ListPatient() {
  const listPatient = useFisioStore((state) => state.patients)
  const setListPatients = useFisioStore((state) => state.setListPatients)
  const setEvolutions = useFisioStore((state) => state.setEvolutions)

  const [currentPackageIndex, setCurrentPackageIndex] = useState(0)
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null
  )
  const [search, setSearch] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [displayedPatientId, setDisplayedPatientId] = useState<string | null>(
    null
  )
  const [isCompactViewport, setIsCompactViewport] = useState(false)
  const lastSelectedPatientId = useRef<string | null>(null)
  const focusTimeout = useRef<number | null>(null)

  const focusPatientRow = useCallback((patientId: string) => {
    if (focusTimeout.current !== null) {
      window.clearTimeout(focusTimeout.current)
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    focusTimeout.current = window.setTimeout(
      () => {
        focusTimeout.current = null
        if (new URLSearchParams(window.location.search).has("patientId")) {
          return
        }

        const target =
          document.querySelector<HTMLButtonElement>(
            `[data-patient-id="${patientId}"]`
          ) ??
          document.querySelector<HTMLButtonElement>("[data-patient-id]") ??
          document.querySelector<HTMLInputElement>("[data-patient-search]")
        target?.focus()
      },
      reducedMotion ? 0 : 320
    )
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)")
    const updateViewport = () => setIsCompactViewport(mediaQuery.matches)
    updateViewport()
    mediaQuery.addEventListener("change", updateViewport)
    return () => mediaQuery.removeEventListener("change", updateViewport)
  }, [focusPatientRow])

  const handlePopState = useCallback(() => {
    const patientId = new URLSearchParams(window.location.search).get(
      "patientId"
    )
    setSelectedPatientId(patientId)
    if (patientId) {
      lastSelectedPatientId.current = patientId
      setDisplayedPatientId(patientId)
    } else if (lastSelectedPatientId.current) {
      focusPatientRow(lastSelectedPatientId.current)
      lastSelectedPatientId.current = null
    }
  }, [])

  useEffect(() => {
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [handlePopState])

  useEffect(() => {
    if (selectedPatientId) {
      setDisplayedPatientId(selectedPatientId)
      return
    }

    if (!displayedPatientId) return

    if (window.matchMedia("(min-width: 1024px)").matches) {
      setDisplayedPatientId(null)
      return
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    const timeout = window.setTimeout(
      () => setDisplayedPatientId(null),
      reducedMotion ? 0 : 320
    )
    return () => window.clearTimeout(timeout)
  }, [selectedPatientId, displayedPatientId])

  useEffect(() => {
    let cancelled = false

    void Promise.all([getPatientsForList(), getSessionEvolutions()])
      .then(([patients, evolutions]) => {
        if (cancelled) return
        setListPatients(patients)
        setEvolutions(evolutions)
        const requestedPatientId = new URLSearchParams(
          window.location.search
        ).get("patientId")
        if (requestedPatientId) {
          const requestedPatient = patients.find(
            (patient) => patient.id === requestedPatientId
          )
          if (requestedPatient) {
            const detailUrl = new URL(window.location.href)
            const historyState = getHistoryState()

            if (
              historyState.__fisioPatientDetailEntry !== true ||
              detailUrl.searchParams.get("patientId") !== requestedPatient.id
            ) {
              const listUrl = new URL(detailUrl)
              listUrl.searchParams.delete("patientId")
              const baseState = {
                ...historyState,
                __fisioPatientListBase: true,
              }
              delete baseState.__fisioPatientDetailEntry
              window.history.replaceState(
                baseState,
                "",
                getRelativeUrl(listUrl)
              )
              window.history.pushState(
                {
                  ...baseState,
                  __fisioPatientListBase: false,
                  __fisioPatientDetailEntry: true,
                },
                "",
                getRelativeUrl(detailUrl)
              )
            }

            lastSelectedPatientId.current = requestedPatient.id
            setSelectedPatientId(requestedPatient.id)
            setDisplayedPatientId(requestedPatient.id)
          }
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? `Não foi possível carregar os pacientes: ${error.message}`
              : "Não foi possível carregar os pacientes."
          )
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [handlePopState, setEvolutions, setListPatients])

  const findPatient =
    search.length > 1
      ? listPatient.filter((patient) =>
        `${patient.firstName} ${patient.surName}`
          .toLocaleLowerCase()
          .includes(search)
      )
      : listPatient

  const selectedPatient =
    listPatient.find((patient) => patient.id === selectedPatientId) ?? null
  const displayedPatient =
    listPatient.find((patient) => patient.id === displayedPatientId) ?? null
  const isShowingPatient = Boolean(selectedPatient)

  function handleSelectPatient(patientId: string) {
    const url = new URL(window.location.href)
    const currentPatientId = url.searchParams.get("patientId")

    if (currentPatientId !== patientId) {
      url.searchParams.set("patientId", patientId)
      const historyState = getHistoryState()
      const isCompactLayout = window.matchMedia("(max-width: 1023px)").matches
      const shouldAddBackEntry = isCompactLayout && !selectedPatientId
      const nextState = {
        ...historyState,
        __fisioPatientListBase: false,
        __fisioPatientDetailEntry:
          shouldAddBackEntry || historyState.__fisioPatientDetailEntry === true,
      }

      if (shouldAddBackEntry) {
        window.history.pushState(nextState, "", getRelativeUrl(url))
      } else {
        window.history.replaceState(nextState, "", getRelativeUrl(url))
      }
    }

    lastSelectedPatientId.current = patientId
    setSelectedPatientId(patientId)
    setDisplayedPatientId(patientId)
  }

  function handleBackToPatients() {
    const url = new URL(window.location.href)
    const historyState = getHistoryState()
    const hasListHistoryEntry =
      historyState.__fisioPatientDetailEntry === true &&
      url.searchParams.get("patientId") === selectedPatientId

    if (hasListHistoryEntry) {
      window.history.back()
      return
    }

    url.searchParams.delete("patientId")
    const nextState = { ...historyState }
    delete nextState.__fisioPatientDetailEntry
    window.history.replaceState(nextState, "", getRelativeUrl(url))
    setSelectedPatientId(null)
    if (lastSelectedPatientId.current) {
      focusPatientRow(lastSelectedPatientId.current)
      lastSelectedPatientId.current = null
    }
  }

  useEffect(() => {
    setCurrentPackageIndex(0)
  }, [selectedPatientId])

  useEffect(() => {
    if (!isCompactViewport || !isShowingPatient) return
    window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLButtonElement>("[data-patient-back]")
        ?.focus()
    })
  }, [isCompactViewport, isShowingPatient, selectedPatientId])

  return (
    <section className="font-open-sans flex h-full min-h-0 flex-col">
      {/*Barra de pesquisa | botão adicionar paciente*/}
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out motion-reduce:duration-0 ${isShowingPatient
          ? "invisible max-h-0 opacity-0 lg:visible lg:max-h-none lg:overflow-visible lg:opacity-100"
          : "visible max-h-48 opacity-100 lg:max-h-none"
          }`}
      >
        <SubHeaderPatientList onSearchChange={setSearch} />
      </div>

      <div className="relative pr-2 pb-2 flex min-h-0 flex-1 overflow-hidden lg:items-stretch lg:min-h-130">
        <div
          aria-hidden={isCompactViewport && isShowingPatient}
          inert={isCompactViewport && isShowingPatient}
          className={`relative h-full w-full shrink-0 transform transition-transform duration-300 ease-in-out motion-reduce:duration-0 lg:w-64 ${isShowingPatient
            ? "pointer-events-none -translate-x-full"
            : "translate-x-0"
            } lg:translate-x-0 lg:transform-none lg:pointer-events-auto xl:w-80`}
        >
          {isLoading ? (
            <div className="flex h-full min-h-0 items-center justify-center rounded-md bg-white p-6 text-slate-500">
              Carregando pacientes...
            </div>
          ) : (
            <PatientSidebar
              patients={findPatient}
              search={search}
              selectedPatientId={selectedPatientId}
              onSelectPatient={handleSelectPatient}
            />
          )}
        </div>

        <div
          aria-hidden={isCompactViewport && !isShowingPatient}
          inert={isCompactViewport && !isShowingPatient}
          className={`relative h-full w-full shrink-0 transform transition-transform duration-300 ease-in-out motion-reduce:duration-0 lg:min-w-0 lg:flex-1 lg:w-auto ${isShowingPatient
            ? "-translate-x-full"
            : "pointer-events-none translate-x-0"
            } lg:translate-x-0 lg:transform-none lg:pointer-events-auto`}
        >
          {displayedPatient ? (
            <PatientDetails
              patient={displayedPatient}
              currentPackageIndex={currentPackageIndex}
              setCurrentPackageIndex={setCurrentPackageIndex}
              onBackToPatients={handleBackToPatients}
              onPatientDeleted={handleBackToPatients}
            />
          ) : (
            <div className="hidden h-full lg:flex">
              <PatientEmptyState />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ListPatient
