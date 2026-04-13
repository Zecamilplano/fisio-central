function formatTelephone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11)

  if (digits.length <= 10) {
    // Fixo: (11) 1234-5678
    return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2")
  } else {
    // Celular: (11) 91234-5678
    return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2")
  }
}

function unformatPhone(value: string) {
  return value.replace(/\D/g, "")
}

export { formatTelephone, unformatPhone }
