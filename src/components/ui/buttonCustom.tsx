type ButtonProps = {
  variant: "single" | "double" | "finish"
  onPrev?: () => void
  onRegisterAdd?: () => void
  onRegisterViewPatient?: () => void
  onNext?: () => void
  active: boolean
}

function Button({
  variant,
  onPrev,
  onRegisterAdd,
  onRegisterViewPatient,
  onNext,
  active,
}: ButtonProps) {
  // console.log(active)
  return (
    <>
      {/*Botões anterior e próximo*/}
      <fieldset className="flex gap-2">
        {/*Botão anterior*/}
        {variant === "single" && (
          <button
            type="button"
            onClick={onNext}
            className={` text-xl  font-open-sans  rounded-md py-3 w-full  my-6 cursor-pointer hover:opacity-80 active:opacity-60
                      ${active ? "bg-[#FFA725] text-white" : "bg-[#FFCC80] text-[#E65100]"}
`}
          >
            Próximo
          </button>
        )}

        {variant === "double" && (
          <>
            <button
              type="button"
              onClick={onPrev}
              className="text-gray-700 text-xl  font-open-sans bg-gray-200 rounded-md py-3 w-full  my-6 cursor-pointer hover:opacity-80 active:opacity-60"
            >
              Anterior
            </button>

            <button
              type="button"
              onClick={onNext}
              className={` text-xl  font-open-sans  rounded-md py-3 w-full  my-6 cursor-pointer hover:opacity-80 active:opacity-60
                      ${active ? "bg-[#FFA725] text-white" : "bg-[#FFCC80] text-[#E65100]"}
`}
            >
              Próximo
            </button>
          </>
        )}

        {variant === "finish" && (
          <>
            <button
              type="button"
              onClick={onPrev}
              className="text-gray-700 text-lg  font-open-sans bg-gray-200 rounded-md py-3 w-full  my-6 cursor-pointer hover:opacity-80 active:opacity-60"
            >
              Anterior
            </button>

            <button
              type="button"
              onClick={onRegisterAdd}
              className={` text-lg  font-open-sans  rounded-md py-3 w-full  my-6 cursor-pointer hover:opacity-80 active:opacity-60
                      ${active ? "bg-[#FFA725] text-white" : "bg-[#FFCC80] text-[#E65100]"}
`}
            >
              Cadastrar e adicionar
            </button>

            <button
              type="button"
              onClick={onRegisterViewPatient}
              className={` text-lg  font-open-sans  rounded-md py-3 w-full  my-6 cursor-pointer hover:opacity-80 active:opacity-60
                      ${active ? "bg-[#FFA725] text-white" : "bg-[#FFCC80] text-[#E65100]"}
`}
            >
              Cadastrar e ver paciente
            </button>
          </>
        )}
      </fieldset>
    </>
  )
}

export default Button
