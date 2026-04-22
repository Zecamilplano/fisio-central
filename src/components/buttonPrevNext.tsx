type ButtonPrevNextType = {
  variant: "single" | "double"
  onPrev?: () => void
  onNext?: () => void
  active: boolean
}

function ButtonPrevNext({
  variant,
  onPrev,
  onNext,
  active,
}: ButtonPrevNextType) {
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
      </fieldset>
    </>
  )
}

export default ButtonPrevNext
