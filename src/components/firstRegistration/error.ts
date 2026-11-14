export function mapSignUpError(error: { code?: string; message?: string }) {
  // bloqueio do trigger block_signup_after_first_user (o Auth devolve erro genérico de banco)
  if (error.message?.includes("Database error saving new user")) {
    return "O cadastro inicial já foi feito. Entre com sua conta."
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
