import { createClient } from "@/lib/supabase/client"
import { useClinicStore } from "@/store/clinic/clinicStore"
import { usePatientFormStore } from "@/store/clinic/patientFormStore"
import { useFisioStore } from "@/store/fisio/fisioStore"
import { endRegistrationDraftSession } from "@/lib/drafts/registrationDraft"


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

  // rascunhos do cadastro de paciente (incluem dados pessoais)
  endRegistrationDraftSession()
}
