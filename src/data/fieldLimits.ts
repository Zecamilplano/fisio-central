// Fonte única dos limites de campos do app. Os mesmos valores estão como CHECK
// no banco (supabase/migrations/20261119015915_field_length_limits.sql):
// ao mudar um limite aqui, crie uma migration para mudar lá também.

// cadastro e edição de paciente
export const registerPatientLimits = {
  firstName: 60,
  surName: 80,
  telephoneDigits: 11,
  telephoneFormatted: 15,
  street: 120,
  addressNumber: 999999,
  neighborhood: 80,
  referenceHouse: 200,
  packageSessions: 100,
  sessionsAlreadyCompleted: 10000,
  pricePerSession: 999999.99,
} as const

// perfil da equipe (primeiro cadastro)
export const profileLimits = {
  firstName: 60,
  surName: 80,
  crefito: 30,
  email: 254,
  passwordMin: 8,
  passwordMax: 64,
} as const
