"use client"

import type { DayOfWeek, ListPatient } from "@/types"
import { daysOfWeek } from "@/data"
import type { PatientType } from "@/types/registerPatientsTypes"
import { formatTelephone } from "@/utils/form/phone"
import { compressPatientPhoto } from "@/utils/patient/compressPatientPhoto"
import { X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import type { ChangeEvent, FormEvent } from "react"
import { toast } from "react-toastify"
import {
  getGlobalScheduleDefaults,
  normalizeConfirmation,
  normalizedPatient,
  sameWeekDays,
  validatePatientProfile,
  type FormErrors,
} from "./editPatient/editPatientHelpers"
import { PatientPhotoField } from "./editPatient/PatientPhotoField"
import { PatientDataFields } from "./editPatient/PatientDataFields"
import { PatientScheduleSection } from "./editPatient/PatientScheduleSection"
import { DeletePatientDialog, DeletePatientSection } from "./editPatient/DeletePatient"

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
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const hasProfileChanges =
    JSON.stringify(normalizedPatient(form)) !==
      JSON.stringify(normalizedPatient(originalForm)) ||
    photo !== undefined || removePhoto
  const hasScheduleChanges =
    patient.typeService === "Pacote" &&
    (globalStartDate !== originalGlobalSchedule.startDate ||
      sessionsPerWeek !== originalGlobalSchedule.sessionsPerWeek ||
      !sameWeekDays(globalWeekDays, originalGlobalSchedule.days))
  const hasChanges = hasProfileChanges || hasScheduleChanges

  useEffect(() => {
    setPortalTarget(document.body)
  }, [])

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

  if (!isOpen || !portalTarget) return null

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

  function handleNoNumberChange(noNumber: boolean) {
    setForm((current) => ({
      ...current,
      address: {
        ...current.address,
        noNumber,
        addressNumber: noNumber ? null : current.address.addressNumber,
      },
    }))
    setErrors((current) => ({ ...current, addressNumber: undefined }))
  }

  function handleSessionsPerWeekChange(value: number) {
    setSessionsPerWeek(value)
    setGlobalWeekDays((current) => current.slice(0, value))
    setScheduleError("")
  }

  function handleToggleScheduleDay(day: DayOfWeek, selected: boolean) {
    setGlobalWeekDays((current) =>
      selected
        ? current.filter((item) => item !== day)
        : current.length < sessionsPerWeek
          ? [...current, day]
          : current
    )
    setScheduleError("")
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: FormErrors = {}
    const normalized = normalizedPatient(form)
    if (hasProfileChanges) {
      Object.assign(nextErrors, validatePatientProfile(form))
      if (errors.photo) nextErrors.photo = errors.photo
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

  return createPortal(
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[1px]"
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
            <PatientPhotoField
              photoPreview={photoPreview}
              initials={`${form.firstName[0] ?? ""}${form.surName[0] ?? ""}`.toUpperCase() || "?"}
              hasCurrentImage={Boolean(patient.image)}
              hasNewPhoto={photo !== undefined}
              removePhoto={removePhoto}
              error={errors.photo}
              compressionMessage={compressionMessage}
              isCompressing={isCompressing}
              isSaving={isSaving}
              inputRef={photoInputRef}
              onPhotoChange={handlePhotoChange}
              onClearSelection={clearSelectedPhoto}
              onMarkForRemoval={markPhotoForRemoval}
            />

            <PatientDataFields
              form={form}
              errors={errors}
              onFieldChange={updateField}
              onAddressChange={updateAddress}
              onNoNumberChange={handleNoNumberChange}
            />

            {patient.typeService === "Pacote" && (
              <PatientScheduleSection
                hasPendingSessions={patient.session.some((session) => session.finish === "pendente")}
                startDate={globalStartDate}
                sessionsPerWeek={sessionsPerWeek}
                weekDays={globalWeekDays}
                error={scheduleError}
                disabled={isSaving}
                onStartDateChange={(value) => {
                  setGlobalStartDate(value)
                  setScheduleError("")
                }}
                onSessionsPerWeekChange={handleSessionsPerWeekChange}
                onToggleDay={handleToggleScheduleDay}
              />
            )}

            <DeletePatientSection
              disabled={isSaving || isCompressing || isDeleting}
              onRequestDelete={() => {
                setDeleteConfirmationInput("")
                setDeleteError("")
                setShowDeleteConfirmation(true)
              }}
            />
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
        <DeletePatientDialog
          patientName={patientName}
          deletionCounts={deletionCounts}
          confirmationInput={deleteConfirmationInput}
          error={deleteError}
          isDeleting={isDeleting}
          canConfirm={canConfirmDelete}
          onConfirmationInputChange={setDeleteConfirmationInput}
          onCancel={() => setShowDeleteConfirmation(false)}
          onConfirm={() => void confirmDeletePatient()}
        />
      )}
    </div>,
    portalTarget
  )
}
