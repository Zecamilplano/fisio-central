export type FirstRegistrationValues = {
  firstName: string
  surName: string
  email: string
  password: string
  confirmPassword: string
  crefito: string
  // forma de tratamento nos registros: "Dr.", "Dra." ou "" (sem título)
  title: string
}

export type FirstRegistrationField = keyof FirstRegistrationValues

export type FirstRegistrationErrors = Partial<
  Record<FirstRegistrationField, string>
>
