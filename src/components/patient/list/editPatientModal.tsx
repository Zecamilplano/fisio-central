"use client"

import type {
  DayOfWeek,
  ListPatient,
} from "@/types"
import { daysOfWeek } from "@/data"
import { addDays, format, getDay, parseISO } from "date-fns"
import type { PatientType } from "@/types/registerPatientsTypes"
import { formatTelephone, unformatPhone } from "@/utils/form/phone"
import { compressPatientPhoto } from "@/utils/patient/compressPatientPhoto"
import { Camera, Trash2, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { toast } from "react-toastify"

type EditPatientModalProps = {
  patient: ListPatient
  isOpen: boolean
  onClose: () => void
  onDelete: () => Promise<{ photoCleanupError?: string }>
  onDeleted: () => void
  deletionCounts: {
    packages: number
    sessions: number
    evolutions: number
  }
  onSave: (
    patient: PatientType,
    photo?: File,
    removePhoto?: boolean
  ) => Promise<void>
  onApplyGlobalSchedule: (
    startDate: string,
    sessionsPerWeek: number,
    days: DayOfWeek[],
    showSuccessToast?: boolean
  ) => Promise<boolean>
}

type FormErrors = Partial<
  Record<
    | "firstName"
    | "surName"
    | "telephone"
    | "street"
    | "addressNumber"
    | "neighborhood"
    | "referenceHouse"
    | "photo"
    | "schedule",
    string
  >
>

const characterLimits = {
  firstName: 100,
  surName: 100,
  street: 150,
  neighborhood: 100,
  referenceHouse: 250,
} as const

const inputBaseClass =
  "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition"

function normalizedPatient(patient: PatientType) {
  return {
    firstName: patient.firstName.trim(),
    surName: patient.surName.trim(),
    telephone: unformatPhone(patient.address.telephone),
    street: patient.address.street.trim(),
    addressNumber: patient.address.noNumber
      ? null
      : patient.address.addressNumber,
    noNumber: patient.address.noNumber,
    neighborhood: patient.address.neighborhood.trim(),
    referenceHouse: patient.address.referenceHouse.trim(),
  }
}

function getGlobalScheduleDefaults(patient: ListPatient) {
  const pendingSessions = patient.session
    .filter((session) => session.finish === "pendente")
    .sort((a, b) => a.date.localeCompare(b.date) || a.number - b.number)
  const startDate =
    pendingSessions[0]?.date.slice(0, 10) ?? format(patient.startDate, "yyyy-MM-dd")

  const currentPackage =
    patient.typeService === "Pacote"
      ? patient.packages.find((item) => item.current) ?? patient.packages.at(-1)
      : undefined
  const days = currentPackage?.fixedWeekDays.length
    ? [...currentPackage.fixedWeekDays]
    : [
        ...new Set(
          pendingSessions
            .map((session) => {
              const weekday = getDay(parseISO(session.date))
              return weekday > 0 ? daysOfWeek[weekday - 1] : undefined
            })
            .filter((day): day is DayOfWeek => Boolean(day))
        ),
      ]

  const fallbackWeekday = getDay(parseISO(startDate))
  const fallbackDay =
    (fallbackWeekday > 0 ? daysOfWeek[fallbackWeekday - 1] : undefined) ??
    daysOfWeek[0]
  const selectedDays = days.length ? days : [fallbackDay]

  return {
    startDate,
    sessionsPerWeek: selectedDays.length,
    days: selectedDays,
  }
}

function sameWeekDays(first: DayOfWeek[], second: DayOfWeek[]) {
  return first.length === second.length &&
    first.every((day) => second.includes(day))
}

export function EditPatientModal({
  patient,
  isOpen,
  onClose,
  onDelete,
  onDeleted,
  deletionCounts,
  onSave,
  onApplyGlobalSchedule,
}: EditPatientModalProps) {
  const scheduleDefaults = getGlobalScheduleDefaults(patient)
  const [form, setForm] = useState<PatientType>(patient)
  const [originalForm, setOriginalForm] = useState<PatientType>(patient)
  const [photo, setPhoto] = useState<File | undefined>()
  const [removePhoto, setRemovePhoto] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(patient.image)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("")
  const [deleteError, setDeleteError] = useState("")
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionMessage, setCompressionMessage] = useState("")
  const [globalStartDate, setGlobalStartDate] = useState(scheduleDefaults.startDate)
  const [sessionsPerWeek, setSessionsPerWeek] = useState(scheduleDefaults.sessionsPerWeek)
  const [globalWeekDays, setGlobalWeekDays] = useState<DayOfWeek[]>(scheduleDefaults.days)
  const [originalGlobalSchedule, setOriginalGlobalSchedule] = useState(scheduleDefaults)
  const [scheduleError, setScheduleError] = useState("")
  const photoInputRef = useRef<HTMLInputElement>(null)
  const hasProfileChanges =
    JSON.stringify(normalizedPatient(form)) !==
      JSON.stringify(normalizedPatient(originalForm)) ||
    photo !== undefined || removePhoto
  const hasScheduleChanges =
    globalStartDate !== originalGlobalSchedule.startDate ||
    sessionsPerWeek !== originalGlobalSchedule.sessionsPerWeek ||
    !sameWeekDays(globalWeekDays, originalGlobalSchedule.days)
  const hasChanges = hasProfileChanges || hasScheduleChanges

  useEffect(() => {
    if (!isOpen) return
    setForm(patient)
    setOriginalForm(patient)
    setPhoto(undefined)
    setRemovePhoto(false)
    setPhotoPreview(patient.image)
    setErrors({})
    setShowDeleteConfirmation(false)
    setDeleteConfirmationInput("")
    setDeleteError("")
    setCompressionMessage("")
    const defaults = getGlobalScheduleDefaults(patient)
    setGlobalStartDate(defaults.startDate)
    setSessionsPerWeek(defaults.sessionsPerWeek)
    setGlobalWeekDays(defaults.days)
    setOriginalGlobalSchedule(defaults)
    setScheduleError("")
  // Schedule changes can replace the patient object while this form stays open.
  // Reset form data only when opening the modal or switching patients.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient.id, isOpen])

  useEffect(() => {
    if (!photo) return
    const previewUrl = URL.createObjectURL(photo)
    setPhotoPreview(previewUrl)
    return () => URL.revokeObjectURL(previewUrl)
  }, [photo])

  useEffect(() => {
    if (!isOpen) return

    function handleEscape(event: KeyboardEvent) {
      if (
        event.key !== "Escape" ||
        isSaving ||
        isCompressing ||
        isDeleting ||
        showDeleteConfirmation
      ) return
      if (
        hasChanges &&
        !window.confirm("Há alterações não salvas. Deseja descartá-las?")
      ) {
        return
      }
      onClose()
    }

    window.addEventListener("keydown", handleEscape)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [
    isOpen,
    isSaving,
    isCompressing,
    isDeleting,
    showDeleteConfirmation,
    hasChanges,
    onClose,
  ])

  if (!isOpen) return null

  function updateField(field: "firstName" | "surName", value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function updateAddress(
    field: keyof PatientType["address"],
    value: string | number | null | boolean
  ) {
    setForm((current) => ({
      ...current,
      address: { ...current.address, [field]: value },
    }))
    const errorField =
      field === "telephone"
        ? "telephone"
        : field === "addressNumber"
          ? "addressNumber"
          : field
    setErrors((current) => ({ ...current, [errorField]: undefined }))
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const selectedPhoto = input.files?.[0]
    if (!selectedPhoto) return

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(selectedPhoto.type)
    ) {
      setErrors((current) => ({
        ...current,
        photo: "Escolha uma foto JPG, PNG ou WEBP.",
      }))
      input.value = ""
      return
    }

    setIsCompressing(true)
    setCompressionMessage("")
    setErrors((current) => ({ ...current, photo: undefined }))
    void compressPatientPhoto(selectedPhoto)
      .then((compressedPhoto) => {
        setPhoto(compressedPhoto)
        setRemovePhoto(false)
        setCompressionMessage(
          compressedPhoto.size < selectedPhoto.size
            ? `Foto otimizada: ${(selectedPhoto.size / 1024 / 1024).toFixed(1)} MB → ${(compressedPhoto.size / 1024 / 1024).toFixed(1)} MB.`
            : ""
        )
      })
      .catch((error: unknown) => {
        setErrors((current) => ({
          ...current,
          photo:
            error instanceof Error
              ? error.message
              : "Não foi possível preparar essa foto.",
        }))
        input.value = ""
      })
      .finally(() => setIsCompressing(false))
  }

  function clearSelectedPhoto() {
    setPhoto(undefined)
    setRemovePhoto(false)
    setPhotoPreview(patient.image)
    setCompressionMessage("")
    setErrors((current) => ({ ...current, photo: undefined }))
    if (photoInputRef.current) photoInputRef.current.value = ""
  }

  function markPhotoForRemoval() {
    setPhoto(undefined)
    setRemovePhoto(true)
    setPhotoPreview(null)
    setCompressionMessage("")
    setErrors((current) => ({ ...current, photo: undefined }))
    if (photoInputRef.current) photoInputRef.current.value = ""
  }

  function handleClose() {
    if (isSaving || isCompressing || isDeleting) return
    if (
      hasChanges &&
      !window.confirm("Há alterações não salvas. Deseja descartá-las?")
    ) {
      return
    }
    onClose()
  }

  const patientName = `${patient.firstName} ${patient.surName}`.trim()
  const normalizeConfirmation = (value: string) =>
    value.normalize("NFC").trim().toLocaleLowerCase("pt-BR")
  const canConfirmDelete =
    normalizeConfirmation(deleteConfirmationInput) ===
    normalizeConfirmation(patientName)

  async function confirmDeletePatient() {
    if (!canConfirmDelete || isDeleting) return
    setIsDeleting(true)
    setDeleteError("")

    try {
      const result = await onDelete()
      setIsDeleting(false)
      setShowDeleteConfirmation(false)
      onClose()
      onDeleted()
      if (result.photoCleanupError) {
        toast.warn(
          "Paciente excluído, mas não foi possível remover a foto do armazenamento."
        )
      } else {
        toast.success("Paciente e dados relacionados excluídos do servidor.")
      }
    } catch (error) {
      setIsDeleting(false)
      setDeleteError(
        error instanceof Error
          ? `Não foi possível excluir o paciente: ${error.message}`
          : "Não foi possível excluir o paciente. Tente novamente."
      )
    }
  }

  function fieldClass(error?: string) {
    return error
      ? `${inputBaseClass} border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100`
      : `${inputBaseClass} border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100`
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: FormErrors = {}
    const normalized = normalizedPatient(form)
    if (hasProfileChanges) {
      if (!normalized.firstName) nextErrors.firstName = "Informe o primeiro nome."
      if (!normalized.surName) nextErrors.surName = "Informe o sobrenome."
      if (![10, 11].includes(normalized.telephone.length)) {
        nextErrors.telephone = "Informe um telefone com DDD e 10 ou 11 dígitos."
      }
      if (!normalized.street) nextErrors.street = "Informe a rua."
      if (
        !form.address.noNumber &&
        (form.address.addressNumber === null ||
          !Number.isInteger(form.address.addressNumber) ||
          form.address.addressNumber < 0 ||
          form.address.addressNumber > 2147483647)
      ) {
        nextErrors.addressNumber = "Informe um número inteiro igual ou maior que zero."
      }
      if (!normalized.neighborhood) {
        nextErrors.neighborhood = "Informe o bairro."
      }
      if (errors.photo) nextErrors.photo = errors.photo
      if (form.firstName.trim().length > characterLimits.firstName) {
        nextErrors.firstName = `Use até ${characterLimits.firstName} caracteres.`
      }
      if (form.surName.trim().length > characterLimits.surName) {
        nextErrors.surName = `Use até ${characterLimits.surName} caracteres.`
      }
      if (form.address.street.trim().length > characterLimits.street) {
        nextErrors.street = `Use até ${characterLimits.street} caracteres.`
      }
      if (form.address.neighborhood.trim().length > characterLimits.neighborhood) {
        nextErrors.neighborhood = `Use até ${characterLimits.neighborhood} caracteres.`
      }
      if (
        form.address.referenceHouse.trim().length > characterLimits.referenceHouse
      ) {
        nextErrors.referenceHouse = `Use até ${characterLimits.referenceHouse} caracteres.`
      }
    }
    if (
      hasScheduleChanges &&
      (!globalStartDate ||
        !Number.isInteger(sessionsPerWeek) ||
        sessionsPerWeek < 1 ||
        sessionsPerWeek > daysOfWeek.length ||
        globalWeekDays.length !== sessionsPerWeek)
    ) {
      nextErrors.schedule = "Informe a frequência e selecione a mesma quantidade de dias."
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    if (!hasChanges) return

    setIsSaving(true)
    try {
      if (
        hasScheduleChanges &&
        !(await onApplyGlobalSchedule(
          globalStartDate,
          sessionsPerWeek,
          globalWeekDays,
          false
        ))
      ) {
        return
      }

      if (hasProfileChanges) {
        await onSave(
          {
            ...form,
            firstName: form.firstName.trim(),
            surName: form.surName.trim(),
            address: {
              ...form.address,
              telephone: formatTelephone(normalized.telephone),
              street: form.address.street.trim(),
              addressNumber: form.address.noNumber
                ? null
                : form.address.addressNumber,
              neighborhood: form.address.neighborhood.trim(),
              referenceHouse: form.address.referenceHouse.trim(),
            },
          },
          photo,
          removePhoto
        )
      }
      toast.success("Alterações salvas no servidor.")
      onClose()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `Não foi possível atualizar o cadastro: ${error.message}`
          : "Não foi possível atualizar o cadastro."
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[1px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-patient-title"
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 id="edit-patient-title" className="text-lg font-semibold text-slate-800">
              Editar cadastro
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Atualize os dados e a foto de perfil do paciente.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving || isCompressing}
            aria-label="Fechar edição"
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="min-h-0 overflow-y-auto">
          <div className="space-y-5 px-5 py-5">
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Prévia da foto de perfil"
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-400 text-2xl font-semibold text-white">
                  {`${form.firstName[0] ?? ""}${form.surName[0] ?? ""}`.toUpperCase() || "?"}
                </div>
              )}
              <div>
                <label
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 ${errors.photo ? "border-red-500" : "border-slate-300"}`}
                >
                  <Camera size={16} />
                  Trocar foto
                  <input
                    type="file"
                    ref={photoInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    disabled={isCompressing || isSaving}
                    className="sr-only"
                  />
                </label>
                <p className="mt-1 text-xs text-slate-500">
                  JPG, PNG ou WEBP. Fotos acima de 5 MB serão comprimidas.
                </p>
                {(photo || removePhoto || errors.photo) && (
                  <button
                    type="button"
                    onClick={clearSelectedPhoto}
                    disabled={isCompressing || isSaving}
                    className="mt-1 block text-xs font-medium text-amber-700 underline disabled:opacity-50"
                  >
                    {photo
                      ? "Desfazer troca da foto"
                      : patient.image || removePhoto
                        ? "Manter foto atual"
                        : "Limpar erro da foto"}
                  </button>
                )}
                {patient.image && !photo && !removePhoto && (
                  <button
                    type="button"
                    onClick={markPhotoForRemoval}
                    disabled={isCompressing || isSaving}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-red-600 underline transition-colors hover:text-red-700 active:text-red-800 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    Remover foto
                  </button>
                )}
                {removePhoto && (
                  <p className="mt-1 text-xs text-slate-500">
                    A foto será removida ao salvar.
                  </p>
                )}
                {isCompressing && (
                  <p className="mt-1 text-xs text-slate-500">Comprimindo foto...</p>
                )}
                {compressionMessage && !errors.photo && (
                  <p className="mt-1 text-xs text-emerald-700">
                    {compressionMessage}
                  </p>
                )}
                {errors.photo && (
                  <p role="alert" className="mt-1 text-xs text-red-600">
                    {errors.photo}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium text-slate-700">
                Primeiro nome
                <input
                  className={fieldClass(errors.firstName)}
                  maxLength={characterLimits.firstName}
                  value={form.firstName}
                  onChange={(event) => updateField("firstName", event.target.value)}
                  aria-invalid={Boolean(errors.firstName)}
                />
                {errors.firstName && <span className="text-xs text-red-600">{errors.firstName}</span>}
                <span className="block text-right text-xs font-normal text-slate-400">
                  {form.firstName.length}/{characterLimits.firstName}
                </span>
              </label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700">
                Sobrenome
                <input
                  className={fieldClass(errors.surName)}
                  maxLength={characterLimits.surName}
                  value={form.surName}
                  onChange={(event) => updateField("surName", event.target.value)}
                  aria-invalid={Boolean(errors.surName)}
                />
                {errors.surName && <span className="text-xs text-red-600">{errors.surName}</span>}
                <span className="block text-right text-xs font-normal text-slate-400">
                  {form.surName.length}/{characterLimits.surName}
                </span>
              </label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
                Telefone
                <input
                  className={fieldClass(errors.telephone)}
                  type="tel"
                  maxLength={15}
                  value={form.address.telephone}
                  onChange={(event) =>
                    updateAddress("telephone", formatTelephone(event.target.value))
                  }
                  aria-invalid={Boolean(errors.telephone)}
                />
                {errors.telephone && <span className="text-xs text-red-600">{errors.telephone}</span>}
                <span className="block text-right text-xs font-normal text-slate-400">
                  {unformatPhone(form.address.telephone).length}/11 dígitos
                </span>
              </label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
                Rua
                <input
                  className={fieldClass(errors.street)}
                  maxLength={characterLimits.street}
                  value={form.address.street}
                  onChange={(event) => updateAddress("street", event.target.value)}
                  aria-invalid={Boolean(errors.street)}
                />
                {errors.street && <span className="text-xs text-red-600">{errors.street}</span>}
                <span className="block text-right text-xs font-normal text-slate-400">
                  {form.address.street.length}/{characterLimits.street}
                </span>
              </label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700">
                Número
                <input
                  className={fieldClass(errors.addressNumber)}
                  type="number"
                  min={0}
                  max={2147483647}
                  step={1}
                  disabled={form.address.noNumber}
                  value={form.address.noNumber ? "" : form.address.addressNumber ?? ""}
                  onChange={(event) =>
                    updateAddress(
                      "addressNumber",
                      event.target.value === "" ? null : Number(event.target.value)
                    )
                  }
                  aria-invalid={Boolean(errors.addressNumber)}
                />
                {errors.addressNumber && <span className="text-xs text-red-600">{errors.addressNumber}</span>}
                <span className="flex items-center gap-2 font-normal">
                  <input
                    type="checkbox"
                    checked={form.address.noNumber}
                    onChange={(event) => {
                      const noNumber = event.target.checked
                      setForm((current) => ({
                        ...current,
                        address: {
                          ...current.address,
                          noNumber,
                          addressNumber: noNumber ? null : current.address.addressNumber,
                        },
                      }))
                      setErrors((current) => ({ ...current, addressNumber: undefined }))
                    }}
                  />
                  Sem número
                </span>
              </label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700">
                Bairro
                <input
                  className={fieldClass(errors.neighborhood)}
                  maxLength={characterLimits.neighborhood}
                  value={form.address.neighborhood}
                  onChange={(event) => updateAddress("neighborhood", event.target.value)}
                  aria-invalid={Boolean(errors.neighborhood)}
                />
                {errors.neighborhood && <span className="text-xs text-red-600">{errors.neighborhood}</span>}
                <span className="block text-right text-xs font-normal text-slate-400">
                  {form.address.neighborhood.length}/{characterLimits.neighborhood}
                </span>
              </label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
                Ponto de referência <span className="font-normal text-slate-400">(opcional)</span>
                <textarea
                  className={fieldClass(errors.referenceHouse)}
                  rows={3}
                  maxLength={characterLimits.referenceHouse}
                  value={form.address.referenceHouse}
                  onChange={(event) => updateAddress("referenceHouse", event.target.value)}
                />
                {errors.referenceHouse && <span className="text-xs text-red-600">{errors.referenceHouse}</span>}
                <span className="block text-right text-xs font-normal text-slate-400">
                  {form.address.referenceHouse.length}/{characterLimits.referenceHouse}
                </span>
              </label>
            </div>

            <section className="space-y-4 border-t border-slate-200 pt-5">
              <div>
                <h3 className="text-base font-semibold text-slate-800">
                  Agenda global das sessões pendentes
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  A data inicial, frequência e dias escolhidos serão aplicados a todas as sessões pendentes deste paciente.
                </p>
              </div>

              {patient.session.some((session) => session.finish === "pendente") ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-1.5 text-sm font-medium text-slate-700">
                      Data inicial
                      <input
                        type="date"
                        value={globalStartDate}
                        disabled={isSaving}
                        onChange={(event) => {
                          setGlobalStartDate(event.target.value)
                          setScheduleError("")
                        }}
                        className={`${inputBaseClass} border-slate-300`}
                      />
                    </label>
                    <label className="space-y-1.5 text-sm font-medium text-slate-700">
                      Sessões por semana
                      <input
                        type="number"
                        min={1}
                        max={daysOfWeek.length}
                        step={1}
                        value={sessionsPerWeek}
                        disabled={isSaving}
                        onChange={(event) => {
                          const value = Number(event.target.value)
                          if (!Number.isInteger(value) || value < 1 || value > daysOfWeek.length) return
                          setSessionsPerWeek(value)
                          setGlobalWeekDays((current) => current.slice(0, value))
                          setScheduleError("")
                        }}
                        className={`${inputBaseClass} border-slate-300`}
                      />
                    </label>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-700">
                      Dias da semana ({globalWeekDays.length}/{sessionsPerWeek})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map((day) => {
                        const selected = globalWeekDays.includes(day)
                        const reachedLimit = globalWeekDays.length >= sessionsPerWeek
                        return (
                          <button
                            key={day}
                            type="button"
                            disabled={isSaving || (!selected && reachedLimit)}
                            aria-pressed={selected}
                            onClick={() => {
                              setGlobalWeekDays((current) =>
                                selected
                                  ? current.filter((item) => item !== day)
                                  : current.length < sessionsPerWeek
                                    ? [...current, day]
                                    : current
                              )
                              setScheduleError("")
                            }}
                            className={`rounded-full border px-3 py-1.5 text-sm transition ${selected ? "border-amber-400 bg-amber-50 font-medium text-amber-800" : "border-slate-300 text-slate-600 hover:bg-slate-50"} disabled:cursor-not-allowed disabled:opacity-50`}
                          >
                            {day}
                          </button>
                        )
                      })}
                    </div>
                    {scheduleError && (
                      <p role="alert" className="mt-2 text-xs text-red-600">
                        {scheduleError}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <p className="rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-500">
                  Não há sessões pendentes para editar.
                </p>
              )}
            </section>

            <section className="space-y-3 border-t border-red-200 pt-5">
              <div>
                <h3 className="text-base font-semibold text-red-700">
                  Excluir paciente
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Apaga permanentemente o cadastro, os pacotes, as sessões, as
                  evoluções e a foto deste paciente.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmationInput("")
                  setDeleteError("")
                  setShowDeleteConfirmation(true)
                }}
                disabled={isSaving || isCompressing || isDeleting}
                className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 active:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={16} />
                Excluir paciente
              </button>
            </section>
          </div>

          <footer className="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving || isCompressing || isDeleting}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || isCompressing || isDeleting || !hasChanges}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-wait disabled:opacity-60"
            >
              {isCompressing
                ? "Comprimindo foto..."
                : isSaving
                  ? "Salvando..."
                  : hasChanges
                    ? "Salvar alterações"
                    : "Nenhuma alteração"}
            </button>
          </footer>
        </form>
      </section>

      {showDeleteConfirmation && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting) {
              setShowDeleteConfirmation(false)
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-patient-title"
            aria-describedby="delete-patient-description"
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl"
          >
            <h2 id="delete-patient-title" className="text-lg font-semibold text-red-700">
              Excluir {patientName} permanentemente?
            </h2>
            <p id="delete-patient-description" className="mt-2 text-sm text-slate-600">
              Esta ação não pode ser desfeita. Serão apagados:
            </p>
            <ul className="my-3 list-inside list-disc rounded-lg bg-red-50 px-3 py-3 text-sm text-red-800">
              <li>{deletionCounts.packages} pacotes</li>
              <li>{deletionCounts.sessions} sessões</li>
              <li>{deletionCounts.evolutions} evoluções</li>
              <li>O cadastro e a foto de perfil</li>
            </ul>

            <label className="block text-sm font-medium text-slate-700">
              Para confirmar, digite o nome completo do paciente:
              <input
                autoFocus
                value={deleteConfirmationInput}
                onChange={(event) => setDeleteConfirmationInput(event.target.value)}
                disabled={isDeleting}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-100"
                autoComplete="off"
              />
            </label>

            {deleteError && (
              <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {deleteError}
              </p>
            )}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
                disabled={isDeleting}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void confirmDeletePatient()}
                disabled={!canConfirmDelete || isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? "Excluindo paciente..." : "Excluir permanentemente"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
