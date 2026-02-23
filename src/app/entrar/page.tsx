
function Login() {
  return (
    <main className="bg-green-700 w-full flex-1 pt-[20%]  md:pt-0 flex justify-center md:items-center ">

      <section className="bg-white flex justify-center items-center flex-col px-3 w-full max-w-[90%] h-110 md:w-120 md:max-h-screen overflow-y-auto rounded-md shadow-2xl">
        <h1 className="py-6 text-3xl font-montserrat font-bold tracking-tight text-[#FFA726]">Entrar</h1>

        <form className="font-open-sans py-2 px-3 w-full ">
          <label
            htmlFor="email"
            className="pb-2  text-lg text-[#FFA726] font-medium w-full "
          >
            Email:
          </label> <br />

          <input type="email" name="email" placeholder="Digite seu email:"
            className="w-full border-2 border-[#FFA726]/40 focus:outline-[#FFA726] rounded-md px-2 py-3 bg-[#EAE9E9] text-gray-600 placeholder:text-text-gray-400"
          />

          <label
            htmlFor="password"
            className="block pt-2  text-lg text-[#FFA726] font-medium"
          >
            Senha:
          </label>

          <input type="password" name="password" placeholder="Digite sua senha:"
            className="w-full border-2 border-[#FFA726]/40 focus:outline-[#FFA726] rounded-md px-2 py-3 bg-[#EAE9E9] text-gray-600 placeholder:text-gray-400"
          /> <br /> <br />

          <button
            type="submit"
            className="text-white text-lg font-bold bg-[#FFA726] rounded-md py-3 w-[60%] block mx-auto mb-6 cursor-pointer hover:opacity-80 active:opacity-60"
          >
            Entrar
          </button>
        </form>
      </section>

    </main>
  )
}
export default Login
