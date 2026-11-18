import { ProgressActionButton } from "./progressActionButton"

type ButtonProps = {
  variant: "single" | "double" | "finish"
  textAlt?: string
  // "submit": o botão principal envia o formulário (Enter funciona) e quem
  // trata a ação é o onSubmit do <form>, então o onNext não é chamado no clique
  type?: "button" | "submit"
  onPrev?: () => void
  onRegisterAdd?: () => void
  onRegisterViewPatient?: () => void
  onNext?: () => void
  active: boolean
  isSubmitting?: boolean
}

function Button({
  variant,
  textAlt,
  type = "button",
  onPrev,
  onRegisterAdd,
  onRegisterViewPatient,
  onNext,
  active,
  isSubmitting = false,
}: ButtonProps) {
  return (
    <>
      {/*Botões anterior e próximo*/}
      <fieldset className="flex gap-2">
        {/*Botão anterior*/}
        {variant === "single" && (
          <ProgressActionButton
            type={type}
            onClick={type === "submit" ? undefined : onNext}
            disabled={isSubmitting}
            loading={isSubmitting}
            className={` text-xl  font-open-sans  rounded-md py-3 w-full  my-6 cursor-pointer hover:opacity-80 active:opacity-60
                      ${active ? "bg-[#FFA725] text-white" : "bg-[#FFCC80] text-[#E65100]"} disabled:cursor-wait disabled:opacity-60
`}
          >
            {isSubmitting ? "Salvando..." : (textAlt ?? "Próximo")}
          </ProgressActionButton>
        )}

        {variant === "double" && (
          <>
            <button
              type="button"
              onClick={onPrev}
              disabled={isSubmitting}
              className="text-gray-700 text-xl font-open-sans bg-gray-200 rounded-md py-3 w-full my-6 cursor-pointer hover:opacity-80 active:opacity-60 disabled:cursor-wait disabled:opacity-60"
            >
              Anterior
            </button>

            <ProgressActionButton
              type={type}
              onClick={type === "submit" ? undefined : onNext}
              disabled={isSubmitting}
              loading={isSubmitting}
              className={` text-xl  font-open-sans  rounded-md py-3 w-full  my-6 cursor-pointer hover:opacity-80 active:opacity-60
                      ${active ? "bg-[#FFA725] text-white" : "bg-[#FFCC80] text-[#E65100]"} disabled:cursor-wait disabled:opacity-60
`}
            >
              {isSubmitting ? "Salvando..." : "Próximo"}
            </ProgressActionButton>
          </>
        )}

        {variant === "finish" && (
          <>
            <button
              type="button"
              onClick={onPrev}
              disabled={isSubmitting}
              className="text-gray-700 text-lg font-open-sans bg-gray-200 rounded-md py-3 w-full my-6 cursor-pointer hover:opacity-80 active:opacity-60 disabled:cursor-wait disabled:opacity-60"
            >
              Anterior
            </button>

            <ProgressActionButton
              type="button"
              onClick={onRegisterAdd}
              disabled={isSubmitting}
              loading={isSubmitting}
              className={` text-lg  font-open-sans  rounded-md py-3 w-full  my-6 cursor-pointer hover:opacity-80 active:opacity-60
                      ${active ? "bg-[#FFA725] text-white" : "bg-[#FFCC80] text-[#E65100]"} disabled:cursor-wait disabled:opacity-60
`}
            >
              {isSubmitting ? "Salvando..." : "Cadastrar e adicionar"}
            </ProgressActionButton>

            {/* com type="submit", Enter na etapa 3 equivale a este botão */}
            <ProgressActionButton
              type={type}
              onClick={type === "submit" ? undefined : onRegisterViewPatient}
              disabled={isSubmitting}
              loading={isSubmitting}
              className={` text-lg  font-open-sans  rounded-md py-3 w-full  my-6 cursor-pointer hover:opacity-80 active:opacity-60
                      ${active ? "bg-[#FFA725] text-white" : "bg-[#FFCC80] text-[#E65100]"} disabled:cursor-wait disabled:opacity-60
`}
            >
              {isSubmitting ? "Salvando..." : "Cadastrar e ver paciente"}
            </ProgressActionButton>
          </>
        )}
      </fieldset>
    </>
  )
}

export default Button
