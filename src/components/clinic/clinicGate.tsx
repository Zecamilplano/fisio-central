"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useClinicStore } from "@/store/clinic/clinicStore"
import { CreateClinicModal } from "./createClinicModal"
import { ensureRegistrationDraftOwner } from "@/lib/drafts/registrationDraft"

export function ClinicGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const status = useClinicStore((s) => s.status)
  const [loadError, setLoadError] = useState(false)

  async function loadMembership() {
    setLoadError(false)

    try {
      const supabase = createClient()

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        router.replace("/entrar")
        return
      }

      // rascunho de cadastro de outro usuário ou vencido (1 h) é descartado antes
      // de qualquer tela restaurá-lo (as telas só montam depois do setReady)
      ensureRegistrationDraftOwner(user.id)

      // a equipe enxerga todos os membros da clínica, então filtra o próprio vínculo
      const { data, error } = await supabase
        .from("clinic_members")
        .select("clinic_id, role")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        useClinicStore.getState().setNeedsClinic()
        return
      }

      useClinicStore.getState().setReady(data.clinic_id, data.role)
    } catch (error) {
      // sem isso a tela ficava presa em "loading" (só o header aparecia)
      console.error("ClinicGate: falha ao carregar o vínculo da clínica", error)
      setLoadError(true)
    }
  }

  // carrega ao montar e de novo sempre que a store voltar para "loading" (ex.: após login/logout)
  useEffect(() => {
    if (status === "loading") loadMembership()
  }, [status])

  if (loadError) {
    return (
      <div role="alert">
        <p>Não foi possível carregar os dados da clínica.</p>
        <button onClick={loadMembership}>Tentar novamente</button>
      </div>
    )
  }

  if (status === "loading") return null // ou seu componente de loading

  if (status === "needs-clinic") {
    return <CreateClinicModal onCreated={loadMembership} />
  }

  return <>{children}</>
}
