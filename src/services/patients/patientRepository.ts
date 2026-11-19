import { assertCanEdit } from "@/lib/clinic/assertCanEdit"
import { createClient } from "@/lib/supabase/client"
import { registerPatientLimits } from "@/data/fieldLimits"
import type {
  PackageSelectType,
  PatientType,
  ServiceForm,
  TypeServiceType,
} from "@/types"
import { getClinicId } from "@/lib/clinic/getClinicId"

const PHOTO_BUCKET = "patient-photos"
const PHOTO_MAX_BYTES = 5 * 1024 * 1024
const PHOTO_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
}

// valida e envia a foto; devolve o caminho salvo no Storage
async function uploadPatientPhoto(
  supabase: ReturnType<typeof createClient>,
  clinicId: string,
  photo: File
): Promise<string> {
  const extension = PHOTO_EXTENSIONS[photo.type]
  if (!extension)
    throw new Error("A foto deve estar no formato JPG, PNG ou WEBP.")
  if (photo.size > PHOTO_MAX_BYTES)
    throw new Error("A foto deve ter no máximo 5 MB.")

  const path = `${clinicId}/${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, photo, { contentType: photo.type, upsert: false })
  if (error) throw new Error(error.message)

  return path
}

export async function createPatient(
  patient: PatientType,
  photo?: File
): Promise<string> {
  assertCanEdit()
  const clinicId = getClinicId()
  const supabase = createClient()

  // a foto só é enviada se o usuário escolheu uma
  const photoPath = photo
    ? await uploadPatientPhoto(supabase, clinicId, photo)
    : null

  const { data, error } = await supabase
    .from("patients")
    .insert({
      clinic_id: clinicId,
      first_name: patient.firstName.trim(),
      sur_name: patient.surName.trim(),
      telephone: patient.address.telephone,
      street: patient.address.street,
      address_number: patient.address.noNumber
        ? null
        : patient.address.addressNumber,
      no_number: patient.address.noNumber,
      neighborhood: patient.address.neighborhood,
      reference_house: patient.address.referenceHouse,
      photo_path: photoPath,
    })
    .select("id")
    .single()

  if (error) {
    // não deixa foto órfã no Storage se o cadastro falhou
    if (photoPath) await supabase.storage.from(PHOTO_BUCKET).remove([photoPath])
    throw new Error(error.message)
  }

  return data.id
}

export async function updatePatientProfile(
  patientId: string,
  patient: PatientType,
  photo?: File,
  removePhoto = false
): Promise<{ photoUrl?: string | null }> {
  assertCanEdit()
  const supabase = createClient()
  const { data: currentPatient, error: currentPatientError } = await supabase
    .from("patients")
    .select("photo_path")
    .eq("id", patientId)
    .single()

  if (currentPatientError) throw new Error(currentPatientError.message)

  let photoPath = removePhoto
    ? null
    : (currentPatient.photo_path as string | null)
  let photoUrl: string | undefined

  if (photo) {
    const clinicId = getClinicId()
    const newPhotoPath = await uploadPatientPhoto(supabase, clinicId, photo)

    const { data: signedUrl, error: signedUrlError } = await supabase.storage
      .from(PHOTO_BUCKET)
      .createSignedUrl(newPhotoPath, 60 * 60)

    if (signedUrlError) {
      await supabase.storage.from(PHOTO_BUCKET).remove([newPhotoPath])
      throw new Error(signedUrlError.message)
    }

    photoPath = newPhotoPath
    photoUrl = signedUrl.signedUrl
  }

  const { error: updateError } = await supabase
    .from("patients")
    .update({
      first_name: patient.firstName.trim(),
      sur_name: patient.surName.trim(),
      telephone: patient.address.telephone,
      street: patient.address.street,
      address_number: patient.address.noNumber
        ? null
        : patient.address.addressNumber,
      no_number: patient.address.noNumber,
      neighborhood: patient.address.neighborhood,
      reference_house: patient.address.referenceHouse,
      photo_path: photoPath,
      updated_at: new Date().toISOString(),
    })
    .eq("id", patientId)
    .select("id")
    .single()

  if (updateError) {
    if (photo && photoPath) {
      await supabase.storage.from("patient-photos").remove([photoPath])
    }
    throw new Error(updateError.message)
  }

  if ((photo || removePhoto) && currentPatient.photo_path) {
    const { error: removeOldPhotoError } = await supabase.storage
      .from("patient-photos")
      .remove([currentPatient.photo_path])
    if (removeOldPhotoError) {
      console.error(
        "Não foi possível remover a foto anterior do paciente:",
        removeOldPhotoError.message
      )
    }
  }

  if (photoUrl) return { photoUrl }
  if (removePhoto) return { photoUrl: null }
  return {}
}

export async function deletePatientPermanently(
  patientId: string
): Promise<{ photoCleanupError?: string }> {
  assertCanEdit()
  const supabase = createClient()
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("photo_path")
    .eq("id", patientId)
    .single()

  if (patientError) throw new Error(patientError.message)

  const { data: deleted, error: deleteError } = await supabase.rpc(
    "delete_patient_permanently",
    { p_patient_id: patientId }
  )
  if (deleteError) throw new Error(deleteError.message)
  if (!deleted) throw new Error("O paciente não foi excluído.")

  if (patient.photo_path) {
    const { error: photoError } = await supabase.storage
      .from("patient-photos")
      .remove([patient.photo_path])
    if (photoError) {
      console.error(
        "Paciente excluído, mas não foi possível remover a foto do Storage:",
        photoError.message
      )
      return { photoCleanupError: photoError.message }
    }
  }

  return {}
}

export async function clearPatientTreatmentDraft(
  patientId: string,
  treatmentId: string,
  removeTreatment: boolean
): Promise<void> {
  assertCanEdit()
  const supabase = createClient()
  const { data: treatment, error: treatmentLookupError } = await supabase
    .from("patient_treatments")
    .select("id")
    .eq("id", treatmentId)
    .eq("patient_id", patientId)
    .maybeSingle()

  if (treatmentLookupError) throw new Error(treatmentLookupError.message)
  if (!treatment) {
    throw new Error("Não encontrei o atendimento salvo para limpar.")
  }

  const { data: sessions, error: sessionsError } = await supabase
    .from("treatment_sessions")
    .select("id")
    .eq("treatment_id", treatmentId)

  if (sessionsError) throw new Error(sessionsError.message)

  const sessionIds = (sessions ?? []).map((session) => session.id)
  if (sessionIds.length > 0) {
    const { error: evolutionError } = await supabase
      .from("treatment_session_evolutions")
      .delete()
      .in("session_id", sessionIds)
    if (evolutionError) throw new Error(evolutionError.message)

    const { error: deleteSessionsError } = await supabase
      .from("treatment_sessions")
      .delete()
      .eq("treatment_id", treatmentId)
    if (deleteSessionsError) throw new Error(deleteSessionsError.message)
  }

  const { error: profileError } = await supabase
    .from("patient_treatment_profiles")
    .delete()
    .eq("patient_id", patientId)
  if (profileError) throw new Error(profileError.message)

  if (removeTreatment) {
    const { data: deletedTreatment, error: treatmentError } = await supabase
      .from("patient_treatments")
      .delete()
      .eq("id", treatmentId)
      .eq("patient_id", patientId)
      .select("id")
      .maybeSingle()

    if (treatmentError) throw new Error(treatmentError.message)
    if (!deletedTreatment) {
      throw new Error("Não encontrei o atendimento salvo para limpar.")
    }
  }
}

export async function getPatientById(id: string): Promise<PatientType | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("patients")
    .select(
      "first_name, sur_name, telephone, street, address_number, no_number, neighborhood, reference_house"
    )
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  return {
    firstName: data.first_name,
    surName: data.sur_name,
    address: {
      telephone: data.telephone,
      street: data.street,
      addressNumber: data.address_number,
      noNumber: data.no_number,
      neighborhood: data.neighborhood,
      referenceHouse: data.reference_house,
    },
  }
}
export async function getPatientServiceById(
  patientId: string
): Promise<{ treatmentId: string | null; serviceForm: ServiceForm }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("patient_treatments")
    .select("id, treatment_type, planned_sessions, price_per_session")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)

  if (!data) {
    return {
      treatmentId: null,
      serviceForm: {
        selectService: null,
        totalSessions: null,
        selectPackage: null,
        priceSession: "60",
      },
    }
  }

  const selectService: TypeServiceType | null =
    data.treatment_type === "package"
      ? "pacote"
      : data.treatment_type === "single"
        ? "sessoes"
        : null

  const totalSessions =
    selectService === "pacote" ? data.planned_sessions : null

  let selectPackage: PackageSelectType | null = null

  if (totalSessions !== null) {
    const savedPackage = String(totalSessions)
    selectPackage = (["4", "6", "8", "10"] as const).includes(
      savedPackage as "4" | "6" | "8" | "10"
    )
      ? (savedPackage as PackageSelectType)
      : "custom"
  }

  return {
    treatmentId: data.id,
    serviceForm: {
      selectService,
      totalSessions,
      selectPackage,
      priceSession: String(data.price_per_session),
    },
  }
}

export async function savePatientTreatment(
  patientId: string,
  form: ServiceForm,
  treatmentId?: string | null
): Promise<string> {
  assertCanEdit()
  if (!form.selectService) {
    throw new Error("Selecione o tipo de atendimento.")
  }

  if (
    form.selectService === "pacote" &&
    (!Number.isInteger(form.totalSessions) ||
      (form.totalSessions ?? 0) < 1 ||
      (form.totalSessions ?? 0) > registerPatientLimits.packageSessions)
  ) {
    throw new Error("Informe uma quantidade inteira de sessões maior que zero.")
  }

  const pricePerSession = Number(form.priceSession)
  if (
    !Number.isFinite(pricePerSession) ||
    pricePerSession < 0 ||
    pricePerSession > registerPatientLimits.pricePerSession
  ) {
    throw new Error("Informe um preço válido para a sessão.")
  }

  const now = new Date().toISOString()
  const treatment = {
    patient_id: patientId,
    treatment_type: form.selectService === "pacote" ? "package" : "single",
    planned_sessions: form.selectService === "pacote" ? form.totalSessions : 1,
    price_per_session: pricePerSession,
    updated_at: now,
  }

  const supabase = createClient()

  if (treatmentId) {
    const { data, error } = await supabase
      .from("patient_treatments")
      .update(treatment)
      .eq("id", treatmentId)
      .eq("patient_id", patientId)
      .select("id")
      .single()

    if (error) throw new Error(error.message)
    return data.id
  }

  const { data, error } = await supabase
    .from("patient_treatments")
    .insert({
      id: crypto.randomUUID(),
      clinic_id: getClinicId(),
      ...treatment,
      created_at: now,
    })
    .select("id")
    .single()

  if (error) throw new Error(error.message)
  return data.id
}
