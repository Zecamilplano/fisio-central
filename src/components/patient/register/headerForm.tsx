import useHeaderForm from "@/hook/useHeaderForm"
import { HeaderFormRegisterType } from "@/types/headerFormType"
import { Box, UserRoundPlus, X } from "lucide-react"
import Image from "next/image"

function HeaderFormRegister({ title, subtitle, icon }: HeaderFormRegisterType) {
  const {
    dragEvents,
    isDragging,
    image,
    errorImg,
    setErrorImg,
    removeImage,
    handleFileChange,
  } = useHeaderForm()

  return (
    <fieldset className="font-montserrat my-8 flex flex-col items-center">
      <legend className="text-2xl md:text-3xl text-center text-[#2D2D2D] font-semibold tracking-wide">
        {title}
      </legend>
      <p className="text-sm text-[#8C7B6B] font-medium tracking-wide pt-2">
        {subtitle}
      </p>

      {/*Adicionar foto de perfil*/}
      <div data-error={!!errorImg} className="flex flex-col items-center">
        {icon === "person" &&
          (image.length === 0 ? (
            <>
              <label
                {...dragEvents}
                htmlFor="photo"
                className="group bg-[#FFE0B2] hover:bg-[#FFCC80] active:bg-[#FFB74D] w-22.5 h-22.5 rounded-[50%] flex justify-center items-center cursor-pointer mt-6"
              >
                <UserRoundPlus
                  size={38}
                  className="text-[#F57C00] transition-colors group-hover:text-[#EF6C00] group-active:text-[#E65100]"
                />
                <span className="sr-only">Adicionar foto de perfil</span>
              </label>
              <input
                type="file"
                id="photo"
                name="photo"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setErrorImg)}
                hidden
              />
              {errorImg && (
                <span className="text-[red] mt-3 text-center">{errorImg}</span>
              )}
            </>
          ) : (
            image.map((image, index) => (
              <div key={index} className="flex flex-col items-center mt-6">
                <div
                  className={`flex relative w-22.5 h-22.5 group ${isDragging ? "opacity-50" : "opacity-100"}`}
                  key={image.name}
                >
                  <Image
                    src={image.preview}
                    fill
                    style={{ objectFit: "cover", borderRadius: "50%" }}
                    alt="image"
                  />
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage()
                  }}
                  className="flex gap-2 bg-[#FBBF24] text-[#78350F] hover:opacity-80 active:opacity-60 px-3 py-3 w-full h-full mt-3 rounded-lg"
                >
                  <X /> <span>Remover foto</span>
                </button>
              </div>
            ))
          ))}{" "}
      </div>

      {/*Icone do quadrado*/}
      {icon === "square" && (
        <>
          <label
            htmlFor="square"
            className="bg-[#FFE0B2]  w-22.5 h-22.5 rounded-[50%] flex justify-center items-center cursor-pointer mt-6"
          >
            <Box size={38} className="text-[#F57C00] " />
            <span className="sr-only">Bloco 3D</span>
          </label>
        </>
      )}
    </fieldset>
  )
}
export default HeaderFormRegister
