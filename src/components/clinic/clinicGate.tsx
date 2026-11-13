"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useClinicStore } from "@/store/clinic/clinicStore"
import { CreateClinicModal } from "./createClinicModal"

export function ClinicGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const status = useClinicStore((s) => s.status)
  const [loadError, setLoadError] = useState(false)

  async function loadMembership() {
    setLoadError(false)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.replace("/entrar")
      return
    }

    // o RLS já limita às linhas do próprio usuário
    const { data, error } = await supabase
      .from("clinic_members")
      .select("clinic_id, role")
      .eq("status", "active")
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error(error)
      setLoadError(true)
      return
    }

    if (!data) {
      useClinicStore.getState().setNeedsClinic()
      return
    }

    useClinicStore.getState().setReady(data.clinic_id, data.role)
  }

  useEffect(() => {
    console.log("ClinicGate montou")
    loadMembership()
    return () => console.log("ClinicGate desmontou")
  }, [])

  if (loadError) {
    console.log("status da store:", status)
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
