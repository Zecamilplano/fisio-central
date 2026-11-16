import type { EmailOtpType } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

const ALLOWED_NEXT = new Set(["/redefinir-senha", "/listar-pacientes"])

// Recebe o link dos e-mails do Supabase (ex.: redefinição de senha) e segue para "next".
// Aceita os dois formatos:
// - template padrão (sem SMTP próprio): /auth/confirm?code=...&next=/redefinir-senha
//   (PKCE: só funciona no mesmo navegador em que o link foi pedido)
// - template personalizado (com SMTP): /auth/confirm?token_hash=...&type=recovery&next=...
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const next = searchParams.get("next")

  // só destinos conhecidos: filtrar por prefixo não basta ("/\evil.com" e
  // "/<tab>/evil.com" viram outro site no navegador)
  const safeNext =
    next && ALLOWED_NEXT.has(next) ? next : "/listar-pacientes"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL(safeNext, request.url))
    }
  } else if (tokenHash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    })

    if (!error) {
      return NextResponse.redirect(new URL(safeNext, request.url))
    }
  }

  return NextResponse.redirect(
    new URL("/entrar?motivo=link-invalido", request.url)
  )
}
