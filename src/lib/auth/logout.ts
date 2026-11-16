import { createClient } from "@/lib/supabase/client"
import { useClinicStore } from "@/store/clinic/clinicStore"
import { usePatientFormStore } from "@/store/clinic/patientFormStore"
import { useFisioStore } from "@/store/fisio/fisioStore"

// rascunhos do cadastro de paciente (incluem dados pessoais e de saúde)
const DRAFT_STORAGE_KEYS = [
  "createdPatientId",
  "patientRegistrationStep",
  "formProfile",
  "typeServiceForm",
  "schedulingForm",
]

export async function signOutAndCleanUp() {
  const supabase = createClient()
  await supabase.auth.signOut()

  useClinicStore.getState().reset()
  usePatientFormStore.getState().resetForm()

  // dados de pacientes e evoluções carregados em memória
  const fisio = useFisioStore.getState()
  fisio.setListPatients([])
  fisio.setEvolutions({})
  fisio.setEvolutionAuthors({})

  try {
    DRAFT_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
  } catch {
    // localStorage indisponível (modo privado/bloqueado): nada a limpar
  }
}
