function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase("pt-BR").replace(/\s+/g, "")
}

export { normalizeText }
