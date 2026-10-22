import { createClient } from "@/lib/supabase/client"
import type {
  PackageSelectType,
  PatientType,
  ServiceForm,
  TypeServiceType,
} from "@/types"

export async function createPatient(patient: PatientType, photo?: File) {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("Usuário não autenticado.")
  }

  let photoPath: string | null = null

  if (photo) {
    const extension = photo.type.split("/")[1]

    if (!["jpeg", "png", "webp"].includes(extension)) {
      throw new Error("A foto deve estar no formato JPG, PNG ou WEBP.")
    }

    photoPath = `${user.id}/${crypto.randomUUID()}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from("patient-photos")
      .upload(photoPath, photo, {
        contentType: photo.type,
        upsert: false,
      })

    if (uploadError) {
      throw new Error(uploadError.message)
    }
  }

  const { data, error } = await supabase
    .from("patients")
    .insert({
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
    throw new Error(error.message)
  }

  return data.id
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
  if (!form.selectService) {
    throw new Error("Selecione o tipo de atendimento.")
  }

  if (
    form.selectService === "pacote" &&
    (!Number.isInteger(form.totalSessions) || (form.totalSessions ?? 0) < 1)
  ) {
    throw new Error("Informe uma quantidade inteira de sessões maior que zero.")
  }

  const pricePerSession = Number(form.priceSession)
  if (!Number.isFinite(pricePerSession) || pricePerSession < 0) {
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
      ...treatment,
      created_at: now,
    })
    .select("id")
    .single()

  if (error) throw new Error(error.message)
  return data.id
}
