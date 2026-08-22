"use client"

import { useEffect, useRef, useState } from "react"

import type { FormEvent, KeyboardEvent } from "react"

import type {
  EvolutionFormData,
  EvolutionFormErrors,
  Exercise,
  UseEvolutionFormParams,
  VitalSigns,
  StringListField,
  ExerciseField,
  WarningField,
  TemporaryWarning,
  EvolutionSaveData,
} from "../evolution.types"

import { createEmptyEvolution } from "../evolutionData"
import { normalizeText } from "@/utils/text/normalizeText"

export function useEvolutionForm({
  initialData,
  onSave,
}: UseEvolutionFormParams) {
  const [form, setForm] = useState<EvolutionFormData>(() =>
    initialData ? structuredClone(initialData) : createEmptyEvolution()
  )
  const [errors, setErrors] = useState<EvolutionFormErrors>({})

  const [temporaryWarning, setTemporaryError] =
    useState<TemporaryWarning | null>(null)
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showWarning(field: WarningField, message: string, duration = 5000) {
    console.log(field, message)
    setTemporaryError({ field, message })

    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current)
    }

    errorTimeoutRef.current = setTimeout(() => {
      setTemporaryError(null)
      errorTimeoutRef.current = null
    }, duration)
  }

  function handleFormKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key !== "Enter") return

    if (event.shiftKey) {
      event.preventDefault()
      event.currentTarget.requestSubmit()
      return
    }

    const target = event.target as HTMLElement

    if (target.tagName === "TEXTAREA") return

    event.preventDefault()
  }

  function hasDuplicateExercises(exercises: Exercise[]) {
    const exerciseKeys = exercises
      .filter(
        (exercise) =>
          exercise.name.trim() !== "" && exercise.details.trim() !== ""
      )
      .map(
        (exercise) =>
          `${normalizeText(exercise.name)}::${normalizeText(exercise.details)}`
      )

    return new Set(exerciseKeys).size !== exerciseKeys.length
  }

  function validateForm(): EvolutionFormErrors {
    const newErrors: EvolutionFormErrors = {}

    if (form.goals.every((goal) => goal.trim() === "")) {
      newErrors.goals = "Adicione pelo menos um objetivo."
    }

    if (form.exercises.length === 0) {
      newErrors.exercises = "Adicione pelo menos um exercício."
    }

    if (
      form.exercises.some(
        (exercise) =>
          exercise.name.trim() === "" || exercise.details.trim() === ""
      )
    ) {
      newErrors.exercises =
        "Preencha o nome e a descrição de todos os exercícios."
    }

    if (form.conducts.every((conduct) => conduct.trim() === "")) {
      newErrors.conducts = "Informe pelo menos uma conduta."
    }

    if (form.progress.trim() === "") {
      newErrors.progress = "Descreva a evolução do paciente."
    }

    if (hasDuplicateExercises(form.exercises)) {
      newErrors.exercises = "Existe exercícios repetidos com os mesmos detalhes"
    }

    const hasPainBefore = form.painBefore !== null
    const hasPainAfter = form.painAfter !== null

    if (hasPainBefore !== hasPainAfter) {
      newErrors.painScale = "Preencha os dois campos."
    }
    return newErrors
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const newErrors = validateForm()

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    const { complications, progress, painBefore, painAfter, ...restForm } = form

    let normalizedForm: EvolutionSaveData = {
      ...restForm,

      goals: form.goals.filter((item) => item.trim()),
      conducts: form.conducts.filter((item) => item.trim()),
      orientations: form.orientations.filter((item) => item.trim()),
      nextConducts: form.nextConducts.filter((item) => item.trim()),

      exercises: form.exercises.filter(
        (exercise) => exercise.name.trim() || exercise.details.trim()
      ),

      ...(complications?.trim() && {
        complications: complications.trim(),
      }),

      ...(progress.trim() && {
        progress: progress.trim(),
      }),

      ...(painBefore !== null && {
        painBefore,
      }),

      ...(painAfter !== null && {
        painAfter,
      }),
    }

    onSave(normalizedForm)
  }

  const STRING_LIST_MAX_LENGTH = 150

  function updateStringList(
    field: StringListField,
    index: number,
    value: string
  ) {
    // const maxLength =
    //   field === "name" ? NAME_MAX_LENGTH : DETAILS_MAX_LENGTH

    if (value.length >= STRING_LIST_MAX_LENGTH) {
      showWarning(
        field,
        `Este campo permite no máximo ${STRING_LIST_MAX_LENGTH} caracteres.`
      )
      return
    }

    setForm((current) => ({
      ...current,

      [field]: current[field].map((item, itemIndex) =>
        itemIndex === index ? value : item
      ),
    }))
  }

  function addStringListItem(field: StringListField) {
    setForm((current) => {
      const currentList = current[field]
      const lastItem = currentList[currentList.length - 1]

      if (!lastItem || lastItem.trim() === "") {
        return current
      }

      return {
        ...current,
        [field]: [...currentList, ""],
      }
    })
  }

  function removeStringListItem(field: StringListField, index: number) {
    setForm((current) => {
      const updatedList = current[field].filter(
        (_, itemIndex) => itemIndex !== index
      )

      return {
        ...current,

        [field]: updatedList.length > 0 ? updatedList : [""],
      }
    })
  }

  function clearStringList(field: StringListField) {
    setForm((current) => ({
      ...current,
      [field]: [""],
    }))
  }

  const NAME_MAX_LENGTH = 60
  const DETAILS_MAX_LENGTH = 100

  function updateExercise(
    exerciseId: string,
    field: ExerciseField,
    value: string
  ) {
    const maxLength = field === "name" ? NAME_MAX_LENGTH : DETAILS_MAX_LENGTH

    const fieldLabel =
      field === "name" ? "nome do exercício" : "detalhes do exercício"

    if (value.length >= maxLength) {
      showWarning(
        "exercises",
        `O ${fieldLabel} permite no máximo ${maxLength} caracteres`,
        5000
      )
      return
    }

    setForm((current) => ({
      ...current,
      exercises: current.exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              [field]: value,
            }
          : exercise
      ),
    }))
  }

  function addExercise(afterExerciseId?: string, newExerciseId?: string) {
    const newExercise: Exercise = {
      id: newExerciseId ?? crypto.randomUUID(),
      name: "",
      details: "",
    }

    setForm((previous) => {
      const exercises = [...previous.exercises]

      if (!afterExerciseId) {
        exercises.push(newExercise)
      } else {
        const currentIndex = exercises.findIndex(
          (exercise) => exercise.id === afterExerciseId
        )

        exercises.splice(currentIndex + 1, 0, newExercise)
      }

      return {
        ...previous,
        exercises,
      }
    })
  }

  function removeExercise(exerciseId: string) {
    setForm((current) => {
      const updatedExercises = current.exercises.filter(
        (exercise) => exercise.id !== exerciseId
      )

      return {
        ...current,

        exercises:
          updatedExercises.length > 0
            ? updatedExercises
            : [
                {
                  id: crypto.randomUUID(),
                  name: "",
                  details: "",
                },
              ],
      }
    })
  }

  function clearExercises() {
    setForm((current) => ({
      ...current,

      exercises: [
        {
          id: crypto.randomUUID(),
          name: "",
          details: "",
        },
      ],
    }))
  }

  const VITAL_SIGNS_MAX_LENGTH: Record<keyof VitalSigns, number> = {
    bloodPressure: 7, // 120/80
    heartRate: 3, // 120 → frontend mostra bpm
    respiratoryRate: 2, // 20 → frontend mostra irpm
    oxygenSaturation: 3, // 98 → frontend mostra %
    observations: 500,
  } as const

  const VITAL_SIGNS_LABELS: Record<keyof VitalSigns, string> = {
    bloodPressure: "Pressão arterial",
    heartRate: "Frequência cardíaca",
    respiratoryRate: "Frequência respiratória",
    oxygenSaturation: "Saturação de oxigênio",
    observations: "Observações",
  } as const

  function updateVitalSign(field: keyof VitalSigns, value: string) {
    const maxLength = VITAL_SIGNS_MAX_LENGTH[field]

    if (value.length > maxLength) {
      showWarning(
        field,
        `${VITAL_SIGNS_LABELS[field]} atingiu o limite máximo de ${maxLength} caracteres.`
      )
      return
    }

    setForm((current) => ({
      ...current,

      vitalSigns: {
        ...current.vitalSigns,
        [field]: value,
      },
    }))
  }

  const EVOLUTION_COMPLICATIONS_MAX_LENGTH = 500

  function updateComplications(value: string) {
    const maxLength = value.length === EVOLUTION_COMPLICATIONS_MAX_LENGTH

    if (maxLength) {
      showWarning(
        "complications",
        "O campo de intercorrencia permite no máximo 500 caracteres",
        5000
      )
      return
    }
    setForm((current) => ({
      ...current,
      complications: value,
    }))
  }

  const PROGRESS_MAX_LENGTH = 2000

  function updateProgress(value: string) {
    console.log("teste")
    const maxLength = value.length > PROGRESS_MAX_LENGTH

    if (maxLength) {
      showWarning(
        "progress",
        "O campo de progresso permite no máximo 2000 caracteres"
      )
      return
    }

    setForm((current) => ({
      ...current,
      progress: value,
    }))
  }

  function updatePainBefore(value: number | null) {
    if (value !== null && value > 10) {
      showWarning("updatePainBefore", "Máximo permitido: 10.")
      return
    }

    setForm((current) => ({
      ...current,
      painBefore: value,
    }))
  }

  function updatePainAfter(value: number | null) {
    if (value !== null && value > 10) {
      showWarning("updatePainAfter", "Máximo permitido: 10.")
      return
    }

    setForm((current) => ({
      ...current,
      painAfter: value,
    }))
  }

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current)
      }
    }
  }, [])

  return {
    form,
    errors,
    temporaryWarning,
    showWarning,

    handleSubmit,
    handleFormKeyDown,

    updateStringList,
    addStringListItem,
    removeStringListItem,
    clearStringList,

    updateExercise,
    addExercise,
    removeExercise,
    clearExercises,

    updateVitalSign,
    updateComplications,
    updateProgress,
    updatePainBefore,
    updatePainAfter,
  }
}
