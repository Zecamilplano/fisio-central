import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import {
  LAST_SEEN_COOKIE,
  decideIdle,
  formatLastSeen,
} from "@/lib/auth/idleSession"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          supabaseResponse = NextResponse.next({ request })

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  const pathname = request.nextUrl.pathname

  // logout por inatividade (2 semanas sem navegar): regra em lib/auth/idleSession
  if (user) {
    const now = Date.now()
    const sessionId = typeof user.session_id === "string" ? user.session_id : ""
    const decision = decideIdle(
      request.cookies.get(LAST_SEEN_COOKIE)?.value,
      sessionId,
      now
    )

    if (decision === "logout") {
      // encerra só esta sessão (os outros aparelhos seguem com a contagem deles)
      await supabase.auth.signOut({ scope: "local" })
      const url = request.nextUrl.clone()
      url.pathname = "/entrar"
      url.search = "?motivo=inatividade"
      const redirect = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((c) => redirect.cookies.set(c))
      redirect.cookies.delete(LAST_SEEN_COOKIE)
      return redirect
    }

    if (decision === "touch") {
      supabaseResponse.cookies.set(LAST_SEEN_COOKIE, formatLastSeen(sessionId, now), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 60, // 60 dias (maior que o limite de inatividade)
      })
    }
  }

  const isPublic =
    pathname.startsWith("/entrar") ||
    pathname.startsWith("/primeiro-cadastro") ||
    pathname.startsWith("/esqueci-senha") ||
    pathname.startsWith("/auth/confirm") // link dos e-mails do Supabase

  // 1. deslogado em rota protegida -> /entrar
  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    // /redefinir-senha sem sessão = link do e-mail inválido ou expirado
    if (pathname.startsWith("/redefinir-senha")) {
      url.pathname = "/entrar"
      url.search = "?motivo=link-invalido"
      const redirect = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((c) => redirect.cookies.set(c))
      return redirect
    }
    url.pathname = "/entrar"
    const redirect = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((c) => redirect.cookies.set(c))
    return redirect
  }

  // 1b. primeiro cadastro só enquanto o banco não tiver nenhum usuário
  if (pathname.startsWith("/primeiro-cadastro")) {
    const { data: isOpen, error } = await supabase.rpc("is_first_setup_open")
    if (error || !isOpen) {
      const url = request.nextUrl.clone()
      url.pathname = "/entrar"
      url.search = ""
      const redirect = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((c) => redirect.cookies.set(c))
      return redirect
    }
  }

  // 2. logado em /entrar (sem ?motivo) -> tela inicial
  if (
    user &&
    pathname.startsWith("/entrar") &&
    !request.nextUrl.searchParams.has("motivo")
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/listar-pacientes" // troque pela URL real
    url.search = ""
    const redirect = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((c) => redirect.cookies.set(c))
    return redirect
  }
  return supabaseResponse
}
