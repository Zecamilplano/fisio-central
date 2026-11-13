export const CLINIC_NAME_MIN = 3
export const CLINIC_NAME_MAX = 100

// tira espaços das pontas e colapsa espaços repetidos no meio
export function normalizeClinicName(value: string) {
  return value.trim().replace(/\s+/g, " ")
}

// devolve a mensagem de erro, ou null se o nome for válido
export function validateClinicName(value: string): string | null {
  const name = normalizeClinicName(value)
  if (!name) return "Informe o nome da clínica."
  if (name.length < CLINIC_NAME_MIN)
    return `O nome precisa ter pelo menos ${CLINIC_NAME_MIN} caracteres.`
  if (name.length > CLINIC_NAME_MAX)
    return `O nome pode ter no máximo ${CLINIC_NAME_MAX} caracteres.`
  return null
}
