import { useEffect, useRef, useState, type FormEvent } from "react"

import { scrollToFirstError } from "@/utils/form/scrollToFirstError"

import { initialValues, fieldOrder } from "./constants"
import { validateForm } from "./validation"
import { mapSignUpError } from "./error"
import type {
  FirstRegistrationErrors,
  FirstRegistrationField,
  FirstRegistrationValues,
} from "./types"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "react-toastify"
import {
  PENDING_CONFIRMATION_EMAIL_KEY,
  emailConfirmationRedirectUrl,
} from "@/lib/auth/emailConfirmation"
import { profileLimits } from "@/data/fieldLimits"
import {
  FIRST_REGISTRATION_DRAFT_KEY,
  hasDraftContent,
  parseDraft,
  serializeDraft,
} from "./draft"
import useImageInput from "@/hook/useImageInput"
import { prepareAvatarPhoto } from "@/utils/image/prepareAvatarPhoto"
import {
  savePendingProfilePhoto,
  uploadProfilePhoto,
} from "@/lib/profile/profilePhoto"

// o maxLength dos inputs impede passar do limite, então a validação de
// "máximo" nunca dispara: ao atingir o limite mostramos um aviso na hora
const FIELD_LIMITS: Partial<Record<FirstRegistrationField, number>> = {
  firstName: profileLimits.firstName,
  surName: profileLimits.surName,
  email: profileLimits.email,
  password: profileLimits.passwordMax,
  confirmPassword: profileLimits.passwordMax,
  crefito: profileLimits.crefito,
}

function limitNotice(field: FirstRegistrationField, value: string) {
  const limit = FIELD_LIMITS[field]
  return limit && value.length >= limit
    ? `Limite de ${limit} caracteres atingido.`
    : null
}

export function useFirstRegistration() {
  const [values, setValues] = useState<FirstRegistrationValues>(initialValues)
  const [errors, setErrors] = useState<FirstRegistrationErrors>({})
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [shouldFocusFirstError, setShouldFocusFirstError] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  // foto de perfil opcional, otimizada para avatar (512 px) quando necessário
  const photo = useImageInput(prepareAvatarPhoto)

  // rascunho (sem senha): carrega depois de montar, porque a página também é
  // renderizada no servidor (lá não existe localStorage)
  const [draftLoaded, setDraftLoaded] = useState(false)
  useEffect(() => {
    try {
      const draft = parseDraft(
        localStorage.getItem(FIRST_REGISTRATION_DRAFT_KEY),
        Date.now()
      )
      if (draft) setValues((current) => ({ ...current, ...draft }))
      else localStorage.removeItem(FIRST_REGISTRATION_DRAFT_KEY)
    } catch {
      // localStorage indisponível: segue sem rascunho
    }
    setDraftLoaded(true)
  }, [])

  useEffect(() => {
    if (!draftLoaded) return
    try {
      if (hasDraftContent(values)) {
        localStorage.setItem(
          FIRST_REGISTRATION_DRAFT_KEY,
          serializeDraft(values, Date.now())
        )
      } else {
        localStorage.removeItem(FIRST_REGISTRATION_DRAFT_KEY)
      }
    } catch {
      // localStorage indisponível: segue sem rascunho
    }
  }, [values, draftLoaded])

  useEffect(() => {
    if (!shouldFocusFirstError) return

    scrollToFirstError(formRef.current ?? undefined)
    setShouldFocusFirstError(false)
  }, [errors, shouldFocusFirstError])

  function handleChange(field: FirstRegistrationField, value: string) {
    const nextValues = { ...values, [field]: value }
    setValues(nextValues)

    const notice = limitNotice(field, value)

    if (hasAttemptedSubmit) {
      setErrors({
        ...validateForm(nextValues),
        ...(notice ? { [field]: notice } : {}),
      })
      return
    }

    // antes de tentar enviar: enquanto digita não surge erro novo; só um erro
    // já visível é revalidado (some quando corrigido). O erro completo vem no blur.
    const fieldErrors = validateForm(nextValues)
    setErrors((previous) => ({
      ...previous,
      ...(previous[field] ? { [field]: fieldErrors[field] ?? "" } : {}),
      // trocar a senha pode resolver (ou quebrar) a confirmação já acusada
      ...((field === "password" || field === "confirmPassword") &&
      previous.confirmPassword
        ? { confirmPassword: fieldErrors.confirmPassword ?? "" }
        : {}),
      // aviso de limite aparece na hora (e some ao apagar, pela revalidação acima)
      ...(notice ? { [field]: notice } : {}),
    }))
  }

  function handleBlur(field: FirstRegistrationField) {
    const fieldErrors = validateForm(values)
    setErrors((previous) => ({
      ...previous,
      [field]: fieldErrors[field] ?? "",
      ...(field === "password" && values.confirmPassword
        ? { confirmPassword: fieldErrors.confirmPassword ?? "" }
        : {}),
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting || photo.isCompressing) return
    setHasAttemptedSubmit(true)

    const nextErrors = validateForm(values)
    setErrors(nextErrors)

    if (fieldOrder.some((field) => nextErrors[field])) {
      setShouldFocusFirstError(true)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email: values.email.trim(),
      password: values.password,
      options: {
        // o link do e-mail confirma e já entra no app (sem passar pelo login)
        emailRedirectTo: emailConfirmationRedirectUrl(),
        data: {
          first_name: values.firstName.trim(),
          sur_name: values.surName.trim(),
          crefito: values.crefito.trim(),
          title: values.title || null,
        },
      },
    })

    if (error) {
      toast.error(mapSignUpError(error))
      setIsSubmitting(false)
      return
    }

    // cadastro criado: o rascunho não é mais necessário
    try {
      localStorage.removeItem(FIRST_REGISTRATION_DRAFT_KEY)
    } catch {
      // localStorage indisponível: nada a limpar
    }
    setDraftLoaded(false) // evita regravar o rascunho com os valores ainda na tela

    const photoFile = photo.image[0]?.file
    if (photoFile) {
      if (data.session && data.user) {
        // já logado (sem confirmação de e-mail): envia agora
        try {
          await uploadProfilePhoto(data.user.id, photoFile)
        } catch {
          toast.warn("Cadastro feito, mas a foto não foi enviada. Tente de novo depois.")
        }
      } else {
        // envia automaticamente no primeiro login, depois de confirmar o e-mail
        await savePendingProfilePhoto(values.email, photoFile)
      }
    }

    if (data.session) {
      toast.success("Cadastro concluído!")
      router.replace("/cadastrar-pacientes")
    } else {
      // a tela de login mostra um aviso fixo (com reenvio) usando este e-mail;
      // fica no sessionStorage para não ir parar na URL/histórico
      try {
        sessionStorage.setItem(PENDING_CONFIRMATION_EMAIL_KEY, values.email.trim())
      } catch {
        // sem sessionStorage o aviso aparece sem o e-mail
      }
      router.replace("/entrar?motivo=confirmar-email")
    }
  }

  return {
    values,
    errors,
    formRef,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    photo,
  }
}
