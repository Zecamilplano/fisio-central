"use client"

import { useEffect } from "react"

// tipos de <input> que recebem texto colado
const TEXT_INPUT_TYPES = new Set([
  "text",
  "search",
  "email",
  "tel",
  "url",
  "password",
  "number",
])

function isTextField(target: EventTarget | null): target is HTMLInputElement | HTMLTextAreaElement {
  if (target instanceof HTMLTextAreaElement) return !target.readOnly && !target.disabled
  return (
    target instanceof HTMLInputElement &&
    TEXT_INPUT_TYPES.has(target.type) &&
    !target.readOnly &&
    !target.disabled
  )
}

// Em todo o app: o texto colado entra sem espaços/quebras de linha nas pontas
// (ex.: " 11 98765-4321 " ou "nome@email.com " copiados de outro lugar).
// Roda depois dos handlers do React: campos que já tratam a colagem por conta
// própria (telefone, cadastro de paciente) chamam preventDefault e são ignorados.
export function PasteTrim() {
  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      if (event.defaultPrevented || !isTextField(event.target)) return

      const pasted = event.clipboardData?.getData("text") ?? ""
      const trimmed = pasted.trim()
      if (trimmed === pasted) return

      event.preventDefault()
      if (!trimmed) return // só espaços: não cola nada

      // insertText respeita maxLength, mantém o desfazer (Ctrl+Z) e dispara o
      // evento "input" que o React usa para atualizar o estado do campo
      event.target.focus()
      const inserted = document.execCommand("insertText", false, trimmed)
      if (!inserted) {
        // navegador sem execCommand: insere manualmente e avisa o React
        const field = event.target
        const start = field.selectionStart ?? field.value.length
        const end = field.selectionEnd ?? start
        const next = (field.value.slice(0, start) + trimmed + field.value.slice(end)).slice(
          0,
          field.maxLength > 0 ? field.maxLength : undefined
        )
        const setter = Object.getOwnPropertyDescriptor(
          Object.getPrototypeOf(field),
          "value"
        )?.set
        setter?.call(field, next)
        field.dispatchEvent(new Event("input", { bubbles: true }))
      }
    }

    // no window (última parada da "bolha"): roda depois do React, que no Next
    // escuta no document — assim quem já tratou a colagem chamou preventDefault
    window.addEventListener("paste", handlePaste)
    return () => window.removeEventListener("paste", handlePaste)
  }, [])

  return null
}
