function FirstRegistration() {
  return (
    <main
      className="bg-green-700 flex-1 flex justify-center items-center"
    >
      <section className="bg-white rounded-md px-2 py-2 m-3 w-full max-w-210 h-full flex flex-col items-center  ">
        <h1 className="py-6 text-2xl text-center md:text-3xl font-montserrat font-bold tracking-tight text-[#FFA726]">Cadastro da responsável pelo sistema</h1>

        <form className="font-open-sans py-2 px-3 w-full flex flex-col gap-3 ">
          <legend className="text-sm font-semibold text-[#2E7D32] uppercase tracking-wide">Dados pessoais</legend>

          {/*nome*/}
          <div className="flex flex-col md:flex-row gap-3">
            <fieldset className="md:flex md:flex-col w-full">
              <label
                htmlFor="firstName"

                className=" text-base text-[#424242] font-medium w-full "
              >
                Primeiro nome
              </label>
              <input
                type="text" name="firstName" id="firstName" placeholder="Digite seu nome primeiro nome"
                className="w-full md:w-full border-2 border-[#D0D7DE]/40 focus:outline-[#1B5E20] rounded-md px-2 py-3 bg-[#EAE9E9] text-gray-600 placeholder:text-text-gray-400"
              />

            </fieldset>

            <fieldset className="md:flex md:flex-col w-full">
              <label
                htmlFor="surName"
                className=" text-base text-[#424242] font-medium w-full "
              >
                Sobrenome
              </label>
              <input type="text" name="surName" id="surName" placeholder="Digite seu sobrenome"
                className="w-full md:w-full border-2 border-[#D0D7DE]/40 focus:outline-[#1B5E20] rounded-md px-2 py-3 bg-[#EAE9E9] text-gray-600 placeholder:text-text-gray-400"
              />
            </fieldset>
          </div>

          {/*email*/}
          <fieldset
            className="w-full flex-col"
          >
            <label
              htmlFor="email"
              className=" text-base text-[#424242] font-medium w-full "
            >
              Email
            </label>
            <input type="text" name="email" id="email" placeholder="Digite seu email"
              className="w-full md:w-full border-2 border-[#D0D7DE]/40 focus:outline-[#1B5E20] rounded-md px-2 py-3 bg-[#EAE9E9] text-gray-600 placeholder:text-text-gray-400"
            />
          </fieldset>

          <legend className="text-sm font-semibold text-[#2E7D32] uppercase tracking-wide">Dados de acesso</legend>

          {/*senha*/}
          <div className="flex flex-col md:flex-row gap-3">
            <fieldset className="w-full flex flex-col">
              <label
                htmlFor="password"

                className=" text-base text-[#424242] font-medium w-full "
              >
                Senha:
              </label>
              <input
                type="password" name="password" id="password" placeholder="********"
                className="w-full md:w-full border-2 border-[#D0D7DE]/40 focus:outline-[#1B5E20] rounded-md px-2 py-3 bg-[#EAE9E9] text-gray-600 placeholder:text-text-gray-400"
              />

            </fieldset>

            <fieldset className="w-full flex flex-col">
              <label
                htmlFor="confirmPassword"
                className=" text-base text-[#424242] font-medium w-full "
              >
                Confirme sua senha
              </label>
              <input type="password" name="confirmPassword" id="confirmPassword" placeholder="********"
                className="w-full md:w-full border-2 border-[#D0D7DE]/40 focus:outline-[#1B5E20] rounded-md px-2 py-3 bg-[#EAE9E9] text-gray-600 placeholder:text-text-gray-400"
              />
            </fieldset>
          </div>

          <button
            type="submit"
            className="text-white text-xl font-bold bg-[#FFA726] rounded-md py-3 w-full md:w-75 block mx-auto my-6 cursor-pointer hover:opacity-80 active:opacity-60"
          >
            Cadastrar
          </button>
        </form>
      </section>
    </main>
  )
}

export default FirstRegistration
