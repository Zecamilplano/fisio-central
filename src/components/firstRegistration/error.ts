export function mapSignUpError(error: { code?: string; message?: string }) {
  // bloqueio do trigger block_signup_after_first_user: e-mail fora da lista de
  // liberação (o Auth devolve um erro genérico de banco)
  if (error.message?.includes("Database error saving new user")) {
    return "Este e-mail não foi liberado para cadastro. Fale com quem te enviou o acesso."
  }

  switch (error.code) {
    case "user_already_exists":
    case "email_exists":
      return "Este e-mail já está cadastrado."
    case "weak_password":
      return "Senha fraca. Use uma senha mais forte."
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Muitas tentativas. Aguarde um pouco e tente novamente."
    default:
      return "Não foi possível concluir o cadastro. Tente novamente."
  }
}
