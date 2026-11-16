import type { FirstRegistrationField, FirstRegistrationValues } from "./types"

export const initialValues: FirstRegistrationValues = {
  firstName: "",
  surName: "",
  email: "",
  password: "",
  confirmPassword: "",
  crefito: "",
  title: "",
}

export const fieldOrder: FirstRegistrationField[] = [
  "firstName",
  "surName",
  "email",
  "password",
  "confirmPassword",
  "crefito",
  "title",
]

export const titleOptions = [
  { value: "Dra.", label: "Dra." },
  { value: "Dr.", label: "Dr." },
  { value: "", label: "Sem título" },
] as const
