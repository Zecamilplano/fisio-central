import { profileLimits as limits } from "@/data/fieldLimits"
import type { FirstRegistrationValues, FirstRegistrationErrors } from "./types"

export function validateForm(
  values: FirstRegistrationValues
): FirstRegistrationErrors {
  const errors: FirstRegistrationErrors = {}

  const firstName = values.firstName.trim()
  const surName = values.surName.trim()
  const email = values.email.trim()
  const crefito = values.crefito.trim()

  if (!firstName) {
    errors.firstName = "Informe seu primeiro nome."
  } else if (firstName.length < 2) {
    errors.firstName = "Digite pelo menos 2 caracteres."
  } else if (firstName.length > limits.firstName) {
    errors.firstName = `Use no máximo ${limits.firstName} caracteres.`
  }

  if (!surName) {
    errors.surName = "Informe seu sobrenome."
  } else if (surName.length < 2) {
    errors.surName = "Digite pelo menos 2 caracteres."
  } else if (surName.length > limits.surName) {
    errors.surName = `Use no máximo ${limits.surName} caracteres.`
  }

  if (!email) {
    errors.email = "Informe seu email."
  } else if (email.length > limits.email) {
    errors.email = `Use no máximo ${limits.email} caracteres.`
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = "Digite um email válido."
  }

  if (!values.password.trim()) {
    errors.password = "Informe sua senha."
  } else if (values.password.length < limits.passwordMin) {
    errors.password = `A senha precisa ter pelo menos ${limits.passwordMin} caracteres.`
  } else if (values.password.length > limits.passwordMax) {
    errors.password = `Use no máximo ${limits.passwordMax} caracteres.`
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirme sua senha."
  } else if (values.confirmPassword.length < limits.passwordMin) {
    errors.confirmPassword =
      `A confirmação precisa ter pelo menos ${limits.passwordMin} caracteres.`
  } else if (values.confirmPassword.length > limits.passwordMax) {
    errors.confirmPassword = `Use no máximo ${limits.passwordMax} caracteres.`
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "As senhas não coincidem."
  }

  if (!crefito) {
    errors.crefito = "Informe seu número de CREFITO."
  } else if (crefito.length > limits.crefito) {
    errors.crefito = `Use no máximo ${limits.crefito} caracteres.`
  }

  if (!["", "Dr.", "Dra."].includes(values.title)) {
    errors.title = "Escolha uma das opções."
  }

  return errors
}
