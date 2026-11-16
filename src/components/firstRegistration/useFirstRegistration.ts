import { useEffect, useRef, useState, type FormEvent } from "react"

import { scrollToFirstError } from "@/utils/form/scrollToFirstError"

import {
  initialValues,
  fieldOrder,
  FirstRegistrationErrors,
  FirstRegistrationField,
  FirstRegistrationValues,
  validateForm,
  mapSignUpError,
} from "./index"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "react-toastify"
import useImageInput from "@/hook/useImageInput"
import { prepareAvatarPhoto } from "@/utils/image/prepareAvatarPhoto"
import {
  savePendingProfilePhoto,
  uploadProfilePhoto,
} from "@/lib/profile/profilePhoto"

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

  useEffect(() => {
    if (!shouldFocusFirstError) return

    scrollToFirstError(formRef.current ?? undefined)
    setShouldFocusFirstError(false)
  }, [errors, shouldFocusFirstError])

  function handleChange(field: FirstRegistrationField, value: string) {
    const nextValues = { ...values, [field]: value }
    setValues(nextValues)

    if (hasAttemptedSubmit) {
      setErrors(validateForm(nextValues))
      return
    }

    const fieldErrors = validateForm(nextValues)
    setErrors((previous) => ({
      ...previous,
      [field]: fieldErrors[field] ?? "",
      ...(field === "confirmPassword" ||
      (field === "password" && nextValues.confirmPassword)
        ? { confirmPassword: fieldErrors.confirmPassword ?? "" }
        : {}),
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
      toast.success("Enviamos um link de confirmação para o seu e-mail.", {
        autoClose: 8000,
      })
      router.replace("/entrar")
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
