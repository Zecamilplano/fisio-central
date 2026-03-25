type ButtonPrevNextType = {
  functionButton: "next" | "twoButton"
}

function ButtonPrevNext({ functionButton }: ButtonPrevNextType) {
  return (
    <>
      {/*Botões anterior e próximo*/}
      <fieldset className="flex gap-2">
        {/*Botão anterior*/}
        {functionButton === "next" && (
          <button
            type="button"
            className="text-white text-xl  font-open-sans bg-[#FFA726] rounded-md py-3 w-full  my-6 cursor-pointer hover:opacity-80 active:opacity-60"
          >
            Próximo
          </button>
        )}

        {functionButton === "twoButton" && (
          <>
            <button
              type="button"
              className="text-gray-700 text-xl  font-open-sans bg-gray-200 rounded-md py-3 w-full  my-6 cursor-pointer hover:opacity-80 active:opacity-60"
            >
              Anterior
            </button>

            <button
              type="submit"
              className="text-white text-xl font-bold font-open-sans bg-[#FFA726] rounded-md py-3 w-full  my-6 cursor-pointer hover:opacity-80 active:opacity-60"
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
