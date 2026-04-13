"use client"
import { Bookmark, MapPinHouse, Phone } from "lucide-react"
import { useFormProfile } from "@/hook/useFormProfile"

type ProfileProps = {
  form: ReturnType<typeof useFormProfile>
}

function Profile({ form }: ProfileProps) {
  const {
    patient,
    setPatient,
    errorPatient,
    setErrorPatient,
    handleChange,
    handleErrors,
  } = form

  return (
    <>
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
            value={patient.firstName}
            onChange={(e) => {
              handleChange("firstName", e.target.value)
              setErrorPatient({ ...errorPatient, firstName: "" })
            }}
            onBlur={(e) => handleErrors("firstName", e.target.value)}
            data-error={!!errorPatient.firstName}
            className={`w-full md:w-full border-2  rounded-md px-2 py-3
                       text-[#333] placeholder:text-text-gray-400
                      ${!errorPatient.firstName ? "border-[#D0D7DE]/40 focus:outline-[#FFA726]" : "border-[red] focus:outline-[red]"}
                      ${patient.firstName ? "bg-white" : "bg-[#EAE9E9]"}
                      `}
          />
          {errorPatient.firstName && (
            <span className="flex text-[red] pl-2 py-2">
              {errorPatient.firstName}
            </span>
          )}
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
            value={patient.surName}
            onChange={(e) => {
              handleChange("surName", e.target.value)
              setErrorPatient({ ...errorPatient, surName: "" })
            }}
            onBlur={(e) => handleErrors("surName", e.target.value)}
            data-error={!!errorPatient.surName}
            className={`w-full md:w-full border-2  rounded-md px-2 py-3
                       text-[#333] placeholder:text-text-gray-400
                      ${patient.surName ? "bg-white" : "bg-[#EAE9E9]"}
                      ${!errorPatient.surName ? "border-[#D0D7DE]/40 focus:outline-[#FFA726]" : "border-[red] focus:outline-[red]"}
                      `}
          />
          {errorPatient.surName && (
            <span className="flex text-[red] pl-2 pt-2">
              {errorPatient.surName}
            </span>
          )}
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
          placeholder="00 00000-0000"
          value={patient.telephone}
          onChange={(e) => {
            handleChange("telephone", e.target.value)
            setErrorPatient({ ...errorPatient, telephone: "" })
          }}
          onBlur={(e) => handleErrors("telephone", e.target.value)}
          data-error={!!errorPatient.telephone}
          maxLength={15}
          className={`w-full md:w-full border-2  rounded-md px-2 py-3
                       text-[#333] placeholder:text-text-gray-400
                      ${patient.telephone ? "bg-white" : "bg-[#EAE9E9]"}
                      ${!errorPatient.telephone ? "border-[#D0D7DE]/40 focus:outline-[#FFA726]" : "border-[red] focus:outline-[red]"}
                      `}
        />
        {errorPatient.telephone && (
          <span className="flex text-[red] pl-2 pt-2">
            {errorPatient.telephone}
          </span>
        )}
      </div>

      {/*Endereço*/}
      <fieldset className="flex flex-col md:flex-row flex-wrap w-full gap-2">
        <div className="flex gap-3">
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
              value={patient.street}
              onChange={(e) => {
                handleChange("street", e.target.value)
                setErrorPatient({ ...errorPatient, street: "" })
              }}
              onBlur={(e) => handleErrors("street", e.target.value)}
              data-error={!!errorPatient.street}
              className={`w-full md:w-full border-2  rounded-md px-2 py-3
                       text-[#333] placeholder:text-text-gray-400
                      ${patient.street ? "bg-white" : "bg-[#EAE9E9]"}
                      ${!errorPatient.street ? "border-[#D0D7DE]/40 focus:outline-[#FFA726]" : "border-[red] focus:outline-[red]"}
                      `}
            />
            {errorPatient.street && (
              <span className="flex text-[red] pl-2 pt-2">
                {errorPatient.street}
              </span>
            )}
          </div>

          {/*Número*/}
          <div className="flex flex-col shrink-0">
            <label
              htmlFor="addressNumber"
              className=" text-base text-[#FFA726] font-medium w-full pl-2 flex items-center gap-1"
            >
              Nº
            </label>
            <input
              type="text"
              name="addressNumber"
              id="addressNumber"
              placeholder="000º"
              disabled={patient.noNumber}
              value={patient.noNumber ? "" : (patient.addressNumber ?? "")}
              onChange={(e) => {
                const value = e.target.value

                handleChange(
                  "addressNumber",
                  value === "" ? null : Number(value)
                )
                setErrorPatient({ ...errorPatient, addressNumber: "" })
              }}
              onBlur={(e) => {
                const value = e.target.value
                handleErrors(
                  "addressNumber",
                  value === "" ? null : Number(value)
                )
              }}
              data-error={!!errorPatient.addressNumber}
              className={`w-32 border-2  rounded-md px-2 py-3
                       text-[#333] placeholder:text-text-gray-400
                      ${patient.addressNumber ? "bg-white" : "bg-[#EAE9E9]"}
                      ${!errorPatient.addressNumber ? "border-[#D0D7DE]/40 focus:outline-[#FFA726]" : "border-[red] focus:outline-[red]"}
                      `}
            />

            <label htmlFor="noNumber" className="flex gap-2 pt-2 ">
              <input
                type="checkbox"
                id="noNumber"
                onChange={(e) => {
                  const checked = e.target.checked
                  setPatient((prev) => ({
                    ...prev,
                    noNumber: checked,
                    addressNumber: checked ? null : prev.addressNumber,
                  }))

                  if (checked) {
                    setErrorPatient((prev) => ({
                      ...prev,
                      addressNumber: "",
                    }))
                  }
                }}
              />
              Sem número
            </label>

            {errorPatient.addressNumber && (
              <>
                <span className="flex  text-[red] pl-2 pt-1 ">
                  {errorPatient.addressNumber}
                </span>
              </>
            )}
          </div>
        </div>
        {/*Caixa número baixo*/}
        <div className=" flex-1 flex gap-2">
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
              value={patient.neighborhood}
              onChange={(e) => {
                handleChange("neighborhood", e.target.value)
                setErrorPatient({ ...errorPatient, neighborhood: "" })
              }}
              onBlur={(e) => handleErrors("neighborhood", e.target.value)}
              data-error={!!errorPatient.neighborhood}
              className={`w-full md:w-full border-2 rounded-md px-2 py-3
                       text-[#333] placeholder:text-text-gray-400
                      ${patient.neighborhood ? "bg-white" : "bg-[#EAE9E9]"}
                      ${!errorPatient.neighborhood ? "border-[#D0D7DE]/40 focus:outline-[#FFA726]" : "border-[red] focus:outline-[red]"}
                      `}
            />
            {errorPatient.neighborhood && (
              <span className="flex text-[red] pl-2 pt-2 ">
                {errorPatient.neighborhood}
              </span>
            )}
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
          onChange={(e) => {
            handleChange("referenceHouse", e.target.value)
            setErrorPatient({ ...errorPatient, referenceHouse: "" })
          }}
          onBlur={(e) => handleErrors("referenceHouse", e.target.value)}
          data-error={!!errorPatient.referenceHouse}
          className={`w-full md:w-full border-2  rounded-md px-2 py-3
                       text-[#333] placeholder:text-text-gray-400
                      ${patient.referenceHouse ? "bg-white" : "bg-[#EAE9E9]"}
                      ${!errorPatient.referenceHouse ? "border-[#D0D7DE]/40 focus:outline-[#FFA726]" : "border-[red] focus:outline-[red]"}
                      `}
        />
        {errorPatient.referenceHouse && (
          <span className="flex text-[red] pl-2 pt-2">
            {errorPatient.referenceHouse}
          </span>
        )}
      </div>
    </>
  )
}

export default Profile
