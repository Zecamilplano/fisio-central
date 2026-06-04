"use client"
import IconCoin from "@/components/icons/iconCoin"
import { listPatientData } from "@/data"
import type { ListPatient } from "@/types/"
import { format, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarDays, Check, PencilLine, Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const ignoredWords = ["da", "de", "do", "dos", "das"]

function ListPatient() {
  const [listPatient, setListPatient] = useState<ListPatient[]>(listPatientData)

  const [selectedPatient, setSelectedPatient] = useState<ListPatient | null>(
    null
  )
  console.log(selectedPatient)

  function handleChange<K extends keyof ListPatient>(field: K, value: string) {
    console.log(field, value)
  }

  // console.log(listPatient.map((item) => item.contactInfo))

  return (
    <section className="font-open-sans">
      {/*Barra de pesquisa | botão adicionar paciente*/}
      <header className="flex flex-col lg:flex-row justify-between gap-4 px-2 py-6">
        <form
          role="search"
          className="flex justify-between items-center bg-white px-4 py-2 rounded-4xl w-full lg:w-1/3 h-14"
        >
          <input
            type="search"
            placeholder="Procurar por pacientes"
            className="text-base md:text-xl w-full placeholder:text-[#9CA3AF] outline-none"
          />

          <Search size={28} color="#9CA3AF" className="shrink-0" />
        </form>

        <Link
          href="/cadastrar-paciente"
          className="w-full lg:w-75 bg-[#FFA726] text-lg md:text-2xl text-white px-2 py-3 flex justify-center items-center rounded-4xl lg:rounded-md"
        >
          Adicionar paciente
        </Link>
      </header>

      <div className="flex flex-col lg:flex-row gap-2">
        <div className="flex flex-col lg:flex-row">
          {/*Barra de pacientes*/}
          <aside className="bg-white mx-2 lg:ml-2 flex w-90 lg:w-80 shrink-0 max-h-96 lg:max-h-[900px] overflow-y-auto overflow-x-hidden rounded-md lg:rounded-l-md">
            <ol className="w-full">
              {listPatient.map((value, index) => {
                const initialLetters = value.name
                  .split(" ")
                  .filter((word) => !ignoredWords.includes(word.toLowerCase()))
                  .slice(0, 2)
                  .map((data) => data[0].toUpperCase())
                  .join("")

                return (
                  <li key={index} className="font-open-sans w-full">
                    <div className="w-full h-2 bg-[#E0E0E0]" />

                    <button
                      onClick={() => setSelectedPatient(value)}
                      className={`
                    w-full
                    flex items-center gap-3
                    p-3
                    transition-all duration-200
                    hover:bg-[#F5F7FA]
                    ${
                      selectedPatient?.id === value.id
                        ? "bg-[#E8F0FF]"
                        : "bg-white"
                    }
                  `}
                    >
                      <div className="relative rounded-full bg-[#FFA726] w-9 h-9 flex justify-center items-center shrink-0">
                        {value.image === null ? (
                          <Image
                            src={value.image || "/person.png"}
                            fill
                            alt={`Foto de perfil de ${value.name}`}
                            className="object-cover rounded-full"
                          />
                        ) : (
                          <p className="uppercase text-sm font-semibold text-white">
                            {initialLetters}
                          </p>
                        )}
                      </div>

                      <span className="text-sm md:text-base text-[#1B4332] text-left break-words">
                        {value.name}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </aside>

          <hr className="hidden lg:block bg-[#D9D9D9] w-px h-auto border-none" />
        </div>

        {/*Tela sem informação do paciente*/}
        {selectedPatient === null && (
          <section className="flex justify-center items-center flex-col text-base md:text-lg text-center bg-white w-auto min-h-80 lg:min-h-135 mx-2 lg:mr-2 rounded-md lg:rounded-r-md p-6">
            <p className="text-[#485368]">
              Selecione um paciente para visualizar mais informações do paciente
              <br />
              ou
            </p>

            <Link href="/cadastrar-paciente" className="text-[#2563EB]">
              Adicione um novo paciente
            </Link>
          </section>
        )}

        {/*Detalhes do paciente*/}
        {selectedPatient !== null && (
          <section className="font-open-sans bg-[#F4F6F5] w-auto px-4 md:px-6 py-4 mx-2 lg:mr-2 rounded-md lg:rounded-r-md flex flex-col gap-6 overflow-hidden">
            <header className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <Image
                  src={selectedPatient.image ?? "/person.png"}
                  width={110}
                  height={110}
                  alt="Foto de perfil"
                  className="rounded-full"
                />

                <div className="text-center sm:text-left">
                  <h2 className="text-[#2D3748] text-xl md:text-2xl">
                    {selectedPatient.name}
                  </h2>

                  <p className="bg-[#FFA726]/20 text-[#FFA726] mt-2 px-5 py-2 text-center rounded-4xl">
                    {selectedPatient.typeService}
                  </p>
                </div>
              </div>

              <button className="self-end md:self-auto">
                <PencilLine size={28} color="#737373" />
              </button>
            </header>

            {/*Contato*/}
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
              {Object.values(selectedPatient.contactInfo).map((info, index) => {
                const Icon = info.Icon

                return (
                  <article
                    key={index}
                    className="bg-white flex flex-col items-center justify-center gap-2 py-4 rounded-md"
                  >
                    <Icon color="#FFA726" size={32} />

                    <h3 className="capitalize text-base text-[#64748B]">
                      {info.label}
                    </h3>

                    <p className="text-[#1A1A1A] text-base font-medium text-center px-3 break-words">
                      {info.value}
                    </p>
                  </article>
                )
              })}
            </section>

            {/*Informação da sessão*/}
            <section>
              <header className="flex items-center gap-2 px-2">
                <CalendarDays color="#FFA726" size={24} />

                <h3 className="text-[#2D3748] text-xl md:text-2xl">
                  Informações das sessões
                </h3>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {Object.values(selectedPatient.sessionInfo).map(
                  (info, index) => {
                    return (
                      <article
                        key={index}
                        className="bg-white flex flex-col justify-center items-center gap-2 py-6 rounded-md"
                      >
                        <h3 className="text-lg md:text-xl text-[#64748B]">
                          {info.label}
                        </h3>

                        <p className="text-[#1A1A1A] text-lg md:text-xl font-medium">
                          {info.value}
                        </p>
                      </article>
                    )
                  }
                )}
              </div>
            </section>

            {/*Sessões*/}
            <section className="bg-[#FAFAFA] py-3 px-2 rounded-md">
              <header className="flex flex-col md:flex-row justify-between gap-3 md:items-center">
                <div className="flex gap-2 items-center">
                  <CalendarDays color="#FFA726" size={24} />

                  <h4 className="text-[#2D3748] text-xl md:text-2xl font-medium">
                    Agenda de sessões
                  </h4>
                </div>

                <p className="text-[#2D3748] text-base md:text-xl font-medium">
                  Início: 12/02/2025
                </p>
              </header>

              <ol className="flex flex-col gap-3 pt-4">
                {selectedPatient.session.map((item, index) => {
                  const date = item.date

                  const parsedDate = parse(date, "dd/MM/yyyy", new Date())
                  const newDate = format(parsedDate, "yyyy-MM-dd")

                  const weekDay = format(parsedDate, "EEEE", {
                    locale: ptBR,
                  })
                    .replace("-feira", "")
                    .replace(/^./, (letter) => letter.toUpperCase())

                  return (
                    <li key={index} className="bg-white px-3 py-4 rounded-md">
                      <article className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                          <div className="flex  items-center gap-3 ">
                            {/*Checkbox*/}
                            <label
                              className="
                            cursor-pointer
                            w-6 h-6 rounded-md border border-gray-300 bg-gray-100
                            flex items-center justify-center
                          "
                            >
                              <input type="checkbox" className="hidden peer" />

                              <Check
                                className="hidden peer-checked:flex"
                                color="red"
                                size={20}
                              />
                            </label>

                            <span className="h-10 w-10 flex justify-center items-center text-xl text-white bg-[#FFA726] rounded-full">
                              {item.number}
                            </span>

                            <div className="flex bg-red-900">
                              <time dateTime={newDate}>{date}</time>

                              <span className="px-4 py-1 bg-[#FFA726]/20 text-[#FFA726] text-center border border-solid border-[#CAD5E2] rounded-full">
                                {weekDay}
                              </span>
                            </div>
                          </div>

                          <select
                            value={item.finish ? "Realizada" : "Pendente"}
                            onChange={(e) =>
                              handleChange("session", e.target.value)
                            }
                            className={`rounded-full border px-3 py-1 w-fit ${
                              item.paid === "pago"
                                ? "bg-[#E8F5EE] text-[#2D7A4F] border-[#B6DDC7]"
                                : "bg-[#FFF8EC] text-[#A06000] border-[#F5D58A]"
                            }`}
                          >
                            <option value="pendente">Pendente</option>
                            <option value="realizada">Realizada</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          className={`flex justify-center items-center gap-2 border border-solid px-4 py-2 rounded-md w-full md:w-fit
                        ${
                          item.paid === "pago"
                            ? "bg-emerald-100 border-emerald-300"
                            : "bg-rose-50 border-rose-200"
                        }
                      `}
                        >
                          <IconCoin
                            className={`${
                              item.paid === "pago"
                                ? "text-emerald-700"
                                : "text-rose-600"
                            }`}
                          />

                          {item.paid === "pago" ? (
                            <span className="text-emerald-700">Pago</span>
                          ) : (
                            <span className="text-rose-600">Não pago</span>
                          )}
                        </button>
                      </article>
                    </li>
                  )
                })}
              </ol>
            </section>
          </section>
        )}
      </div>
    </section>
  )
}

export default ListPatient
