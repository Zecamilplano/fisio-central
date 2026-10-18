import { PatientType } from "@/types"
import { createClient } from "@/lib/supabase/client"

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
