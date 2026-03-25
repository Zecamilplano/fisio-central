import { Bookmark, MapPinHouse, Phone } from "lucide-react"
import HeaderFormRegister from "./headerForm"
import ButtonPrevNext from "@/components/buttonPrevNext"

function Profile({ neighborhood }: { neighborhood: string }) {
  return (
    <section>
      <HeaderFormRegister
        title="Dados do Paciente"
        subtitle="Preencha as informações básicas"
        icon="person"
      />
      {/*Primeiro nome, sobrenome*/}
      <fieldset className="flex flex-col md:flex-row w-full gap-4 font-montserrat">
        {/*Primeiro nome*/}
        <div className="w-full">
          <label
            htmlFor="firstName"
            className=" text-base text-[#FFA726] font-medium w-full pl-1 "
          >
            Primeiro nome
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            placeholder="Digite seu nome primeiro nome"
            className="w-full md:w-full border-2 border-[#D0D7DE]/40 focus:outline-[#FFA726] rounded-md px-2 py-3 bg-[#EAE9E9] text-gray-600 placeholder:text-text-gray-400"
          />
        </div>

        {/*Segundo nome*/}
        <div className="w-full">
          <label
            htmlFor="surName"
            className=" text-base text-[#FFA726] font-medium w-full pl-2 flex items-center gap-1"
          >
            Sobrenome
          </label>
          <input
            type="text"
            name="surName"
            id="surName"
            placeholder="Digite seu sobrenome"
            className="w-full md:w-full border-2 border-[#D0D7DE]/40 focus:outline-[#FFA726] rounded-md px-2 py-3 bg-[#EAE9E9] text-gray-600 placeholder:text-text-gray-400"
          />
        </div>
      </fieldset>

      {/*Número de telefone*/}
      <div className="w-full">
        <label
          htmlFor="tel"
          className=" text-base text-[#FFA726] font-medium w-full pl-2 flex items-center gap-1"
        >
          <Phone size={14} /> Telefone
        </label>
        <input
          type="tel"
          name="tel"
          id="tel"
          placeholder="(00) 000000000"
          className="w-full md:w-full border-2 border-[#D0D7DE]/40 focus:outline-[#FFA726] rounded-md px-2 py-3 bg-[#EAE9E9] text-gray-600 placeholder:text-text-gray-400"
        />
      </div>

      {/*Endereço*/}
      <fieldset className="flex flex-col md:flex-row w-full gap-2">
        {/*Rua*/}
        <div className="flex-1">
          <label
            htmlFor="street"
            className=" text-base text-[#FFA726] font-medium w-full pl-2 flex items-center gap-1"
          >
            <MapPinHouse size={14} /> Rua
          </label>
          <input
            type="text"
            name="street"
            id="street"
            placeholder="Digite o nome da rua"
            className="w-full md:w-full border-2 border-[#D0D7DE]/40 focus:outline-[#FFA726] rounded-md px-2 py-3 bg-[#EAE9E9] text-gray-600 placeholder:text-text-gray-400"
          />
        </div>

        {/*Caixa número baixo*/}
        <div className=" flex-1 flex gap-2">
          {/*Número*/}
          <div className=" shrink-0">
            <label
              htmlFor="numberStreet"
              className=" text-base text-[#FFA726] font-medium w-full pl-2 flex items-center gap-1"
            >
              Nº
            </label>
            <input
              type="text"
              name="numberStreet"
              id="numberStreet"
              placeholder="000º"
              className="w-12 border-2 border-[#D0D7DE]/40 focus:outline-[#FFA726] rounded-md px-2 py-3 bg-[#EAE9E9] text-gray-600 placeholder:text-text-gray-400"
            />
          </div>

          {/*Bairro*/}
          <div className="w-full">
            <label
              htmlFor="neighborhood"
              className=" text-base text-[#FFA726] font-medium w-full pl-2 flex items-center gap-1"
            >
              Bairro
            </label>
            <input
              type="text"
              name="neighborhood"
              id="neighborhood"
              value={neighborhood}
              className="w-full border-2 border-[#D0D7DE]/40 focus:outline-[#FFA726] rounded-md px-2 py-3 bg-[#EAE9E9] text-gray-600 placeholder:text-text-gray-400"
            />
          </div>
        </div>
      </fieldset>

      <div className="flex flex-col">
        <label
          htmlFor="reference"
          className=" text-base text-[#FFA726] font-medium w-full pl-2 flex items-center gap-1"
        >
          <Bookmark size={14} />
          Referência
        </label>
        <textarea
          name="reference"
          id="reference"
          rows={4}
          placeholder="Ponto de referência"
          className="w-full md:w-full border-2 border-[#D0D7DE]/40 focus:outline-[#FFA726] rounded-md px-2 py-3 bg-[#EAE9E9] text-gray-600 placeholder:text-text-gray-400"
        />
      </div>

      <ButtonPrevNext functionButton="next" />
    </section>
  )
}

export default Profile
