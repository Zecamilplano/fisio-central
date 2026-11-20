"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useClinicStore } from "@/store/clinic/clinicStore"
import { CreateClinicModal } from "./createClinicModal"
import { ensureRegistrationDraftOwner } from "@/lib/drafts/registrationDraft"
import { signOutAndCleanUp } from "@/lib/auth/logout"
import { StatusPage, primaryActionClassName } from "@/components/ui/statusPage"
import { UserX } from "lucide-react"

export function ClinicGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const status = useClinicStore((s) => s.status)
  const [loadError, setLoadError] = useState(false)
  // conta sem clínica e sem liberação para criar uma (ex.: paciente ainda não
  // ligado ao cadastro, ou o super admin, que não participa de clínicas)
  const [noClinicAccess, setNoClinicAccess] = useState(false)

  async function loadMembership() {
    setLoadError(false)

    try {
      const supabase = createClient()

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        // sessão no cookie mas usuário inexistente/inválido (ex.: banco resetado
        // ou usuário apagado): o token ainda passa no proxy até expirar, então
        // sem limpar o cookie o proxy devolvia para cá e a tela ficava em branco
        await supabase.auth.signOut({ scope: "local" }).catch(() => {})
        router.replace("/entrar?motivo=sessao-invalida")
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
        // só quem teve o e-mail liberado como dona de clínica cria a própria
        const { data: canCreate, error: canCreateError } =
          await supabase.rpc("can_create_clinic")
        if (canCreateError) throw canCreateError

        if (canCreate) {
          setNoClinicAccess(false)
          useClinicStore.getState().setNeedsClinic()
        } else {
          setNoClinicAccess(true)
        }
        return
      }

      setNoClinicAccess(false)

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

  if (noClinicAccess) {
    return (
      <StatusPage
        icon={UserX}
        title="Conta sem clínica"
        description="Sua conta ainda não está vinculada a uma clínica. Se você é paciente, peça para a clínica liberar seu acesso."
      >
        <button
          type="button"
          onClick={async () => {
            await signOutAndCleanUp().catch(() => {})
            router.replace("/entrar")
            router.refresh()
          }}
          className={primaryActionClassName}
        >
          Sair
        </button>
      </StatusPage>
    )
  }

  if (status === "loading") return null // ou seu componente de loading

  if (status === "needs-clinic") {
    return <CreateClinicModal onCreated={loadMembership} />
  }

  return <>{children}</>
}
