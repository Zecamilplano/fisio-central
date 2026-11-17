// Regra do logout por inatividade (usada no proxy). Fica separada para poder
// ser testada sem servidor nem cookies reais.
//
// O cookie guarda "<id da sessão>:<timestamp>", então um login novo (outra
// sessão) começa a contagem do zero em vez de herdar a data antiga.

export const IDLE_LIMIT_MS = 14 * 24 * 60 * 60 * 1000 // 2 semanas
export const LAST_SEEN_REFRESH_MS = 60 * 60 * 1000 // regrava no máximo 1x por hora
export const LAST_SEEN_COOKIE = "fc_last_seen"

export type IdleDecision = "logout" | "touch" | "keep"

export function parseLastSeen(value: string | undefined) {
  const [sessionId, timestamp] = (value ?? "").split(":")
  const time = Number(timestamp)
  return sessionId && Number.isFinite(time) && time > 0
    ? { sessionId, time }
    : null
}

export function formatLastSeen(sessionId: string, now: number) {
  return `${sessionId}:${now}`
}

// logout: passou do limite nesta mesma sessão
// touch:  gravar a atividade agora (sessão nova, cookie ausente ou com mais de 1 h)
// keep:   nada a fazer
export function decideIdle(
  cookieValue: string | undefined,
  sessionId: string,
  now: number
): IdleDecision {
  const lastSeen = parseLastSeen(cookieValue)
  if (!lastSeen || lastSeen.sessionId !== sessionId) return "touch"

  const elapsed = now - lastSeen.time
  if (elapsed > IDLE_LIMIT_MS) return "logout"
  // relógio voltou no tempo ou passou 1 h: regrava
  if (elapsed < 0 || elapsed > LAST_SEEN_REFRESH_MS) return "touch"
  return "keep"
}
