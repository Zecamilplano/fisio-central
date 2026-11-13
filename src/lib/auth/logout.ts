import { createClient } from "@/lib/supabase/client"
import { useClinicStore } from "@/store/clinic/clinicStore"
import { usePatientFormStore } from "@/store/clinic/patientFormStore"

export async function signOutAndCleanUp() {
  const supabase = createClient()
  await supabase.auth.signOut()

  useClinicStore.getState().reset()
  usePatientFormStore.getState().resetForm()

  // rascunho do cadastro de paciente (inclui dados pessoais)
  localStorage.removeItem("createdPatientId")
  localStorage.removeItem("patientRegistrationStep")
  localStorage.removeItem("formProfile")
}
