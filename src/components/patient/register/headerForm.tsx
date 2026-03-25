import { Box, UserRoundPlus } from "lucide-react"

type HeaderFormRegisterType = {
  title: string
  subtitle: string
  icon: "person" | "square"
}

function HeaderFormRegister({ title, subtitle, icon }: HeaderFormRegisterType) {
  return (

    <fieldset className="font-montserrat my-8 flex flex-col items-center">
      <legend className="text-2xl md:text-3xl text-center text-[#2D2D2D] font-semibold tracking-wide">{title}</legend>
      <p className="text-sm text-[#8C7B6B] font-medium tracking-wide pt-2">{subtitle}</p>

      {/*Adicionar foto de perfil*/}
      {icon === "person" && (
        <>
          <label htmlFor="photo" className="group bg-[#FFE0B2] hover:bg-[#FFCC80] active:bg-[#FFB74D] w-22.5 h-22.5 rounded-[50%] flex justify-center items-center cursor-pointer mt-6">
            <UserRoundPlus size={38} className="text-[#F57C00] transition-colors group-hover:text-[#EF6C00] group-active:text-[#E65100]" />
            <span className="sr-only">Adicionar foto de perfil</span>
          </label>
          <input type="file" id="photo" name="photo" hidden />
        </>
      )}

      {/*Icone do quadrado*/}
      {icon === "square" && (
        <>
          <label htmlFor="square" className="group bg-[#FFE0B2] hover:bg-[#FFCC80] active:bg-[#FFB74D] w-22.5 h-22.5 rounded-[50%] flex justify-center items-center cursor-pointer mt-6">
            <Box size={38} className="text-[#F57C00] transition-colors group-hover:text-[#EF6C00] group-active:text-[#E65100]" />
            <span className="sr-only">Bloco 3D</span>
          </label>
        </>
      )}
    </fieldset>
  )
}
export default HeaderFormRegister
