import { createClient } from "@/lib/supabase/client"
import { useClinicStore } from "@/store/clinic/clinicStore"
import { normalizeText, onlyDigits } from "@/lib/validators/patient"
import type { PatientType } from "@/types/"

export async function createPatient(patient: PatientType) {
  const clinicId = useClinicStore.getState().clinicId
  if (!clinicId) {
    return { id: null, error: "Clínica não carregada. Recarregue a página." }
  }

  const supabase = createClient()
  const a = patient.address
  const {
    data: { user },
  } = await supabase.auth.getUser()
  console.log("createPatient -> user:", user?.id, "| clinicId:", clinicId)

  const { data, error } = await supabase
    .from("patients")
    .insert({
      clinic_id: clinicId,
      first_name: normalizeText(patient.firstName),
      sur_name: normalizeText(patient.surName),
      telephone: onlyDigits(a.telephone),
      street: normalizeText(a.street),
      address_number: a.noNumber ? null : a.addressNumber,
      no_number: a.noNumber,
      neighborhood: normalizeText(a.neighborhood),
      reference_house: normalizeText(a.referenceHouse),
    })
    .select("id")
    .single()

  if (error) {
    console.error(error)
    return { id: null, error: "Não foi possível cadastrar o paciente." }
  }

  console.log("clinicId:", useClinicStore.getState().clinicId)

  return { id: data.id as string, error: null }
}
