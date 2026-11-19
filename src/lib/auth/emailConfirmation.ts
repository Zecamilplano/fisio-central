// e-mail do cadastro que ainda aguarda confirmação (lido pela tela de login)
export const PENDING_CONFIRMATION_EMAIL_KEY = "pendingConfirmationEmail"

// para onde o link de confirmação do e-mail leva (precisa estar em
// Authentication > URL Configuration > Redirect URLs, como o da senha)
export const AFTER_CONFIRMATION_PATH = "/cadastrar-pacientes"

export function emailConfirmationRedirectUrl() {
  return `${window.location.origin}/auth/confirm?next=${AFTER_CONFIRMATION_PATH}`
}
