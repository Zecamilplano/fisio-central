import { createClient } from "@/lib/supabase/client"

function mapLoginError(error: { code?: string }) {
  switch (error.code) {
    case "invalid_credentials":
      return "E-mail ou senha incorretos."
    case "email_not_confirmed":
      return "Confirme seu e-mail antes de entrar."
    case "over_request_rate_limit":
      return "Muitas tentativas. Aguarde um pouco e tente novamente."
    default:
      return "Não foi possível entrar. Tente novamente."
  }
}

// devolve a mensagem de erro já traduzida, ou null se deu certo
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  return { error: error ? mapLoginError(error) : null }
}
