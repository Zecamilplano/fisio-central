import { Dumbbell, Plus, Trash2 } from "lucide-react"

import type { Exercise, WarningField } from "../evolution.types"
import EvolutionSection from "./evolutionSection"
import React, { useEffect, useRef, useState } from "react"
import { normalizeText } from "@/utils/text/normalizeText"

type EvolutionExerciseSectionProps = {
  exercises: Exercise[]
  error?: string
  temporaryWarning?: string
  onChange: (
    exerciseId: string,
    field: "name" | "details",
    value: string
  ) => void
  onAdd: (exerciseId?: string, newExerciseId?: string) => void
  onRemove: (exerciseId: string) => void
  onClear: () => void
}

type ExerciseField = "name" | "details"

const NAME_MAX_LENGTH = 60
const DETAILS_MAX_LENGTH = 100

export default function EvolutionExerciseSection({
  exercises,
  error,
  temporaryWarning,
  onChange,
  onAdd,
  onRemove,
  onClear,
}: EvolutionExerciseSectionProps) {
  const inputRefs = useRef<
    Record<string, Record<ExerciseField, HTMLInputElement | null>>
  >({})
  const pendingFocus = useRef<{
    exerciseId: string
    field: ExerciseField
  } | null>(null)

  const [addError, setAddError] = useState<string>("")

  function handleAddExercise(exercise: Exercise) {
    const nameIsEmpty = exercise.name.trim() === ""
    const detailsIsEmpty = exercise.details.trim() === ""

    if (nameIsEmpty && detailsIsEmpty) {
      setAddError(
        "Preencha o nome e os detalhes do exercício antes de adicionar outro."
      )
      return
    }

    if (nameIsEmpty) {
      setAddError("Informe o nome do exercício.")
      inputRefs.current[exercise.id]?.name?.focus()
      return
    }

    if (detailsIsEmpty) {
      setAddError("Informe os detalhes do exercício.")
      inputRefs.current[exercise.id]?.details?.focus()
      return
    }

    const normalizedName = normalizeText(exercise.name)
    const normalizedDetails = normalizeText(exercise.details)

    const exerciseAreadyExists = exercises.some(
      (currentExercise) =>
        currentExercise.id !== exercise.id &&
        normalizeText(currentExercise.name) === normalizedName &&
        normalizeText(currentExercise.details) === normalizedDetails
    )

    if (exerciseAreadyExists) {
      setAddError("Este exercício já foi adicionado com os mesmos detalhes.")
      return
    }

    const newExerciceId = crypto.randomUUID()
    pendingFocus.current = {
      exerciseId: newExerciceId,
      field: "name",
    }

    setAddError("")
    onAdd(exercise.id, newExerciceId)
  }

  function handleExerciseKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
    exercise: Exercise,
    field: ExerciseField
  ) {
    const exerciseIndex = exercises.findIndex(
      (currentExercise) => currentExercise.id === exercise.id
    )

    if (exerciseIndex === -1) return

    // Alt + seta para cima:
    // foca o mesmo campo do exercício anterior.
    if (event.altKey && event.key === "ArrowUp") {
      event.preventDefault()
      event.stopPropagation()

      const previousExercise = exercises[exerciseIndex - 1]

      if (previousExercise) {
        inputRefs.current[previousExercise.id]?.[field]?.focus()
      }

      return
    }

    // Alt + seta para baixo:
    // foca o mesmo campo do próximo exercício.
    if (event.altKey && event.key === "ArrowDown") {
      event.preventDefault()
      event.stopPropagation()

      const nextExercise = exercises[exerciseIndex + 1]

      if (nextExercise) {
        inputRefs.current[nextExercise.id]?.[field]?.focus()
      }

      return
    }

    // Alt + Delete:
    // remove somente o exercício atual.
    if (event.altKey && event.key === "Delete") {
      event.preventDefault()
      event.stopPropagation()

      onRemove(exercise.id)
      return
    }

    // Shift + Delete:
    // remove todos os exercícios.
    if (event.shiftKey && event.key === "Delete") {
      event.preventDefault()
      event.stopPropagation()

      handleClearExercises()
      return
    }

    // Enter:
    // valida o exercício atual, adiciona outro abaixo
    // e depois foca o campo "name" do novo exercício.
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      event.preventDefault()
      event.stopPropagation()

      handleAddExercise(exercise)
    }
  }

  function handleAddButtonClick() {
    const lastExercise = exercises.at(-1)

    if (!lastExercise) {
      const newExerciseId = crypto.randomUUID()

      pendingFocus.current = {
        exerciseId: newExerciseId,
        field: "name",
      }
      onAdd(undefined, newExerciseId)
      return
    }

    handleAddExercise(lastExercise)
  }

  function handleClearExercises() {
    setAddError("")
    onClear()
  }

  useEffect(() => {
    const focusTarget = pendingFocus.current

    if (!focusTarget) return

    requestAnimationFrame(() => {
      inputRefs.current[focusTarget.exerciseId]?.[focusTarget.field]?.focus()
      pendingFocus.current = null
    })
  }, [exercises])

  return (
    <EvolutionSection
      title="Exercícios realizados"
      icon={<Dumbbell size={20} />}
    >
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="grid grid-cols-[1fr_1fr_44px] bg-emerald-50 text-sm font-semibold text-emerald-800">
          <div className="border-r border-slate-200 px-3 py-2">Exercício</div>

          <div className="border-r border-slate-200 px-3 py-2">
            Séries / Carga
          </div>

          <div />
        </div>

        {exercises.map((exercise) => (
          <div
            key={exercise.id}
            className="grid grid-cols-[1fr_1fr_44px] border-t border-slate-200"
          >
            <input
              ref={(element) => {
                inputRefs.current[exercise.id] ??= {
                  name: null,
                  details: null,
                }

                inputRefs.current[exercise.id].name = element
              }}
              type="text"
              value={exercise.name}
              maxLength={NAME_MAX_LENGTH}
              onChange={(event) => {
                onChange(exercise.id, "name", event.target.value)

                if (addError) {
                  setAddError("")
                }
              }}
              onKeyDown={(event) => {
                handleExerciseKeyDown(event, exercise, "name")
              }}
              placeholder="Exercício"
              aria-label={`Nome do exercício. Máximo de ${NAME_MAX_LENGTH} caracteres`}
              className="border-r border-slate-200 px-3 py-2 text-sm outline-none focus:bg-emerald-50"
            />

            <input
              type="text"
              ref={(element) => {
                inputRefs.current[exercise.id] ??= {
                  name: null,
                  details: null,
                }

                inputRefs.current[exercise.id].name = element
              }}
              value={exercise.details}
              maxLength={DETAILS_MAX_LENGTH}
              aria-label={`Detalhe do exercício. Máximo de ${DETAILS_MAX_LENGTH} caracteres`}
              onChange={(event) => {
                onChange(exercise.id, "details", event.target.value)

                if (addError) {
                  setAddError("")
                }
              }}
              onKeyDown={(event) => {
                handleExerciseKeyDown(event, exercise, "details")
              }}
              placeholder="3x10, 20 kg..."
              className="border-r border-slate-200 px-3 py-2 text-sm outline-none focus:bg-emerald-50"
            />

            <button
              type="button"
              onClick={() => onRemove(exercise.id)}
              aria-label="Remover exercício"
              className="flex items-center justify-center text-slate-400 transition hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>

      {addError ? (
        <p role="alert" className="mt-2 text-sm font-medium text-red-600">
          {addError}
        </p>
      ) : (
        error && (
          <p role="alert" className="mt-2 text-sm font-medium text-red-600">
            {error}
          </p>
        )
      )}

      {temporaryWarning && (
        <p
          role="alert"
          aria-live="polite"
          className="t-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800"
        >
          {temporaryWarning}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleAddButtonClick}
          className="flex cursor-pointer items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          <Plus size={16} />
          Adicionar exercício
        </button>

        {exercises.length > 0 && (
          <button
            type="button"
            onClick={handleClearExercises}
            title="Apagar todos — Shift + Delete"
            disabled={
              exercises[0].name.length === 0 &&
              exercises[0].details.length === 0
            }
            className="flex cursor-pointer items-center gap-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={16} />
            Limpar
          </button>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        <strong>Atalhos</strong>: Enter adiciona • Alt + ↑/↓ navega • Alt +
        Delete remove • Shift + Delete limpa todos.
      </p>
    </EvolutionSection>
  )
}
