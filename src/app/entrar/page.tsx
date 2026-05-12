function Login() {
  return (
    <section className=" w-full flex-1 pt-[20%] md:pt-0 flex justify-center md:items-center">
      <section className="bg-white flex justify-center items-center flex-col px-3 w-full max-w-[90%] h-110 md:w-120 md:max-h-screen overflow-y-auto rounded-md shadow-2xl">
        <header>
          <h1 className="py-6 text-3xl font-montserrat font-bold tracking-tight text-[#FFA726]">
            Entrar
          </h1>
        </header>

        <form className="font-open-sans py-2 px-3 w-full">
          <section className="mb-4">
            <label
              htmlFor="email"
              className="pb-2 text-lg text-[#FFA726] font-medium w-full block"
            >
              Email:
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="Digite seu email:"
              className="w-full border-2 border-[#FFA726]/40 focus:outline-[#FFA726] rounded-md px-2 py-3 bg-[#EAE9E9] text-gray-600 placeholder:text-gray-400"
            />
          </section>

          <section className="mb-6">
            <label
              htmlFor="password"
              className="block pb-2 text-lg text-[#FFA726] font-medium"
            >
              Senha:
            </label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder="Digite sua senha:"
              className="w-full border-2 border-[#FFA726]/40 focus:outline-[#FFA726] rounded-md px-2 py-3 bg-[#EAE9E9] text-gray-600 placeholder:text-gray-400"
            />
          </section>

          <footer>
            <button
              type="submit"
              className="text-white text-lg font-bold bg-[#FFA726] rounded-md py-3 w-[60%] block mx-auto mb-6 cursor-pointer hover:opacity-80 active:opacity-60"
            >
              Entrar
            </button>
          </footer>
        </form>
      </section>
    </section>
  )
}
export default Login
