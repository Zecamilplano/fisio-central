const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type LoginField = "email" | "password"
export type LoginValues = Record<LoginField, string>
export type LoginErrors = Partial<Record<LoginField, string>>

export function validateLogin(values: LoginValues): LoginErrors {
  const errors: LoginErrors = {}
  const email = values.email.trim()

  if (!email) errors.email = "Informe seu e-mail."
  else if (!EMAIL_REGEX.test(email)) errors.email = "E-mail inválido."

  if (!values.password) errors.password = "Informe sua senha."

  return errors
}
