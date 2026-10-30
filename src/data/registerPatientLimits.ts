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
