"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmail } from "@/lib/auth/login"
import { validateLogin, type LoginField } from "@/lib/validators/login"
import { useClinicStore } from "@/store/clinic/clinicStore"
import { toast } from "react-toastify"
import { PENDING_CONFIRMATION_EMAIL_KEY } from "@/lib/auth/emailConfirmation"

export function useLogin() {
  const router = useRouter()

  const [values, setValues] = useState({ email: "", password: "" })
  // erros visíveis: aparecem ao sair do campo ou ao enviar; enquanto digita
  // não surge erro novo, mas um erro já visível é revalidado e some
  const [errors, setErrors] = useState<Partial<Record<LoginField, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  // e-mail que tentou entrar sem ter confirmado a conta (mostra o aviso de reenvio)
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null)

  const validation = validateLogin(values)

  function handleChange(field: LoginField, value: string) {
    const nextValues = { ...values, [field]: value }
    setValues(nextValues)
    setSubmitError(null)
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateLogin(nextValues)[field] }))
    }
  }

  function handleBlur(field: LoginField) {
    setErrors((prev) => ({ ...prev, [field]: validation[field] }))
  }

  async function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    if (submitting) return

    setErrors(validation)
    if (validation.email || validation.password) return

    setSubmitting(true)
    setSubmitError(null)

    const { error, code } = await signInWithEmail(values.email, values.password)

    if (error) {
      if (code === "email_not_confirmed") {
        setUnconfirmedEmail(values.email.trim())
        setSubmitError(null) // o aviso de confirmação já explica
      } else {
        setSubmitError(error)
      }
      setValues((prev) => ({ ...prev, password: "" }))
      setSubmitting(false)
      return
    }

    // conta confirmada e logada: o aviso de confirmação não é mais necessário
    try {
      sessionStorage.removeItem(PENDING_CONFIRMATION_EMAIL_KEY)
    } catch {
      // sessionStorage indisponível: nada a limpar
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
    unconfirmedEmail,
    handleChange,
    handleBlur,
    handleSubmit,
  }
}
