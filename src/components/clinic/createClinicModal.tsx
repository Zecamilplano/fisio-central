"use client"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import Modal from "../ui/modal"
import Button from "../ui/buttonCustom"
import {
  normalizeClinicName,
  validateClinicName,
} from "@/lib/validators/clinics"
import { cn } from "tailwind-variants"

export function CreateClinicModal({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // erro de validação visível: aparece ao sair do campo ou ao enviar; enquanto
  // digita não surge erro novo, mas um erro já visível é revalidado e some
  const [fieldError, setFieldError] = useState<string | null>(null)

  const validationError = validateClinicName(name)
  const isValid = validationError === null
  const visibleError = fieldError || error

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (loading) return

    setFieldError(validationError)
    if (validationError) return

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.rpc("create_clinic", {
      p_name: normalizeClinicName(name),
    })

    if (error) {
      setError(
        error.message.includes("not allowed")
          ? "Já existe uma clínica cadastrada. Peça acesso ao administrador."
          : error.message.includes("invalid clinic name")
            ? "Nome inválido. Use entre 3 e 100 caracteres."
            : "Não foi possível criar a clínica. Tente novamente."
      )
      setLoading(false)
      return
    }

    onCreated() // recarrega o vínculo e libera o app
  }

  return (
    <Modal
      isOpen={true}
      size="small"
      onClose={() => {}} // obrigatório: o modal não fecha sem criar a clínica
      hiddenClose={true}
    >
      <form
        noValidate
        onSubmit={handleSubmit}
        className="font-montserrat my-8 flex flex-col items-center"
      >
        <h1 className="text-2xl md:text-3xl text-center text-[#2D2D2D] font-semibold tracking-wide">
          Criar clínica
        </h1>

        <p className="text-sm text-[#8C7B6B] font-medium tracking-wide pt-2">
          Digite o nome da clínica
        </p>

        <div className="my-8">
          <label
            htmlFor="name-clinic"
            className=" text-base text-[#FFA726] font-medium w-full pl-1 "
          >
            Nome da clínica
          </label>
          <input
            type="text"
            id="name-clinic"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError(null)
              if (fieldError) setFieldError(validateClinicName(e.target.value))
            }}
            onBlur={() => setFieldError(validationError)}
            maxLength={100}
            placeholder="Digite o nome da clínica"
            autoFocus
            aria-invalid={Boolean(fieldError)}
            aria-describedby={visibleError ? "clinic-name-error" : undefined}
            className={cn(
              "w-full border-2 rounded-md px-2 py-3 ",
              fieldError
                ? "border-red-500 focus:outline-red-500"
                : "border-[#D0D7DE]/40 focus:outline-[#FFA726]"
            )}
          />
          {visibleError && (
            <p id="clinic-name-error" role="alert" className="text-red-500">
              {visibleError}
            </p>
          )}
          <Button
            variant="single"
            textAlt="Criar clínica"
            type="submit"
            active={isValid}
            isSubmitting={loading}
            onNext={() => handleSubmit()}
          />
        </div>
      </form>
    </Modal>
  )
}
