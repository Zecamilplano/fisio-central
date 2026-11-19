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

const PHONE_DIGITS = 11

// Dígitos de um telefone colado: ignora espaços, parênteses, traços etc. e
// remove o código do país (+55) ou o 0 de discagem quando sobram dígitos.
function normalizePastedPhone(text: string) {
  let digits = unformatPhone(text)
  if (digits.length > PHONE_DIGITS && digits.startsWith("55")) digits = digits.slice(2)
  if (digits.length > PHONE_DIGITS && digits.startsWith("0")) digits = digits.slice(1)
  return digits
}

// Junta o texto colado ao telefone atual (respeitando o trecho selecionado) e
// devolve o valor formatado. "overflow" indica que dígitos foram descartados.
function mergePastedPhone(
  current: string,
  selectionStart: number,
  selectionEnd: number,
  pasted: string
) {
  const before = unformatPhone(current.slice(0, selectionStart))
  const after = unformatPhone(current.slice(selectionEnd))
  const digits = before + normalizePastedPhone(pasted) + after
  return {
    formatted: formatTelephone(digits),
    overflow: digits.length > PHONE_DIGITS,
  }
}

export { formatTelephone, unformatPhone, normalizePastedPhone, mergePastedPhone }
