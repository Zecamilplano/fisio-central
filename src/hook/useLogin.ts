"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmail } from "@/lib/auth/login"
import { validateLogin, type LoginField } from "@/lib/validators/login"
import { useClinicStore } from "@/store/clinic/clinicStore"
import { toast } from "react-toastify"

export function useLogin() {
  const router = useRouter()

  const [values, setValues] = useState({ email: "", password: "" })
  const [touched, setTouched] = useState<Record<LoginField, boolean>>({
    email: false,
    password: false,
  })
  const [attempted, setAttempted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validation = validateLogin(values)

  // só mostra o erro depois que o campo foi tocado ou houve tentativa de envio
  const errors = {
    email: touched.email || attempted ? validation.email : undefined,
    password: touched.password || attempted ? validation.password : undefined,
  }

  function handleChange(field: LoginField, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setSubmitError(null)
  }

  function handleBlur(field: LoginField) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  async function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    if (submitting) return

    setAttempted(true)
    if (validation.email || validation.password) return

    setSubmitting(true)
    setSubmitError(null)

    const { error } = await signInWithEmail(values.email, values.password)

    if (error) {
      setSubmitError(error)
      setValues((prev) => ({ ...prev, password: "" }))
      setSubmitting(false)
      return
    }

    // zera a store para o ClinicGate buscar o vínculo do usuário que entrou
    useClinicStore.getState().reset()
    toast.success("Bem-vindo de volta!")
    // lista: a equipe vê todos os pacientes; o paciente vê só o próprio registro (RLS)
    router.replace("/listar-pacientes")
    router.refresh()
  }

  return {
    values,
    errors,
    submitting,
    submitError,
    handleChange,
    handleBlur,
    handleSubmit,
  }
}
