import { SubHeaderFormRegisterType } from "@/types/subHeaderFormType"
import { Box, UserRoundPlus, X } from "lucide-react"
import Image from "next/image"

function SubHeaderFormRegister({
  img,
  title,
  subtitle,
  icon,
}: SubHeaderFormRegisterType) {
  return (
    <fieldset className="font-montserrat my-8 flex flex-col items-center">
      <legend className="text-2xl md:text-3xl text-center text-[#2D2D2D] font-semibold tracking-wide">
        {title}
      </legend>
      <p className="text-sm text-[#8C7B6B] font-medium tracking-wide pt-2">
        {subtitle}
      </p>

      {/*Adicionar foto de perfil*/}
      <div className="flex flex-col items-center">
        {icon === "person" &&
          img &&
          (img.image.length === 0 ? (
            <>
              <label
                {...img.dragEvents}
                htmlFor="photo"
                aria-label="Adicionar foto de perfil, opcional"
                className={`group mt-6 flex h-22.5 w-22.5 cursor-pointer items-center justify-center rounded-[50%] bg-[#FFE0B2] hover:bg-[#FFCC80] active:bg-[#FFB74D] ${img.isDragging ? "opacity-50" : "opacity-100"} ${img.error ? "ring-2 ring-red-500" : ""}`}
              >
                <UserRoundPlus
                  size={38}
                  className="text-[#F57C00] transition-colors group-hover:text-[#EF6C00] group-active:text-[#E65100]"
                />
                <span className="sr-only">Adicionar foto de perfil, opcional</span>
              </label>
              <input
                type="file"
                id="photo"
                name="photo"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => img.handleFileChange(e)}
                disabled={img.isCompressing}
                hidden
              />
            </>
          ) : (
            img.image.map((image, index) => (
              <div key={index} className="flex flex-col items-center mt-6">
                <div
                  className={`flex relative w-22.5 h-22.5 group ${img.isDragging ? "opacity-50" : "opacity-100"}`}
                  key={image.name}
                >
                  <Image
                    src={image.preview}
                    fill
                    style={{ objectFit: "cover", borderRadius: "50%" }}
                    alt="Foto de perfil do paciente"
                  />
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    img.removeImage()
                  }}
                  className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-[#FBBF24] px-3 py-2 text-sm font-medium text-[#78350F] hover:opacity-80 active:opacity-60"
                >
                  <X /> <span>Remover foto</span>
                </button>
              </div>
            ))
          ))}{" "}
        {icon === "person" && (
          <div className="mt-2 text-center">
            <p className="text-sm text-[#8C7B6B]">
              JPG, PNG ou WEBP. Fotos acima de 5 MB serão comprimidas.
            </p>
            {img?.isCompressing && (
              <p role="status" className="mt-1 text-sm text-slate-500">
                Comprimindo foto...
              </p>
            )}
            {img?.compressionMessage && !img.error && (
              <p className="mt-1 text-sm text-emerald-700">
                {img.compressionMessage}
              </p>
            )}
            {img?.error && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {img.error}
              </p>
            )}
          </div>
        )}
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
export default SubHeaderFormRegister
