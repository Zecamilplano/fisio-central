import type { DayOfWeek } from "@/types"

/**
 * Dia da semana do app -> número do getDay() (date-fns / Date): domingo = 0.
 * Fonte única: antes havia uma cópia deste mapa em vários arquivos e uma delas
 * usava Segunda = 0, o que gravava sessões no dia errado.
 */
export const WEEKDAY_NUMBER: Record<DayOfWeek, number> = {
  Segunda: 1,
  Terça: 2,
  Quarta: 3,
  Quinta: 4,
  Sexta: 5,
  Sábado: 6,
}
