import type { FirstRegistrationField, FirstRegistrationValues } from "./types"

export const initialValues: FirstRegistrationValues = {
  firstName: "",
  surName: "",
  email: "",
  password: "",
  confirmPassword: "",
  crefito: "",
}

export const fieldOrder: FirstRegistrationField[] = [
  "firstName",
  "surName",
  "email",
  "password",
  "confirmPassword",
  "crefito",
]
