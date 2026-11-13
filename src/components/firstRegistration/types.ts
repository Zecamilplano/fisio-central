export type FirstRegistrationValues = {
  firstName: string
  surName: string
  email: string
  password: string
  confirmPassword: string
  crefito: string
}

export type FirstRegistrationField = keyof FirstRegistrationValues

export type FirstRegistrationErrors = Partial<
  Record<FirstRegistrationField, string>
>
