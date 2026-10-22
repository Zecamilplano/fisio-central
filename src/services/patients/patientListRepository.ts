import { createClient } from "@/lib/supabase/client"
import type { DayOfWeek, ListPatient, Session } from "@/types"

type PatientRow = {
  id: string
  first_name: string
  sur_name: string
  telephone: string
  street: string
  address_number: number | null
  no_number: boolean
  neighborhood: string
  reference_house: string | null
  photo_path: string | null
  created_at: string
}

type TreatmentRow = {
  id: string
  patient_id: string
  treatment_type: string
  price_per_session: number
  planned_sessions: number
  status: string
  package_start_date: string | null
  created_at: string
}

type TreatmentSessionRow = {
  id: string
  treatment_id: string
  session_number: number
  session_date: string
  session_time: string
  finish_status: string
  paid_status: string
}

type TreatmentProfileRow = {
  patient_id: string
  initial_start_date: string | null
  sessions_before_current_package: number
}

function toLocalDate(dateValue: string): Date {
  const [year, month, day] = dateValue.slice(0, 10).split("-").map(Number)
  return new Date(year, month - 1, day)
}

function toFinishStatus(value: string): Session["finish"] {
  if (value === "realizado" || value === "completed") return "realizado"
  if (value === "cancelado" || value === "cancelled") return "cancelado"
  return "pendente"
}

function toPaidStatus(value: string): Session["paid"] {
  if (value === "realizado" || value === "completed") return "realizado"
  if (value === "cancelado" || value === "cancelled") return "cancelado"
  return "pendente"
}

const weekdayByNumber: Partial<Record<number, DayOfWeek>> = {
  1: "Segunda",
  2: "Terça",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
  6: "Sábado",
}

function toSessionRows(rows: TreatmentSessionRow[], treatmentId: string): Session[] {
  return rows
    .filter((session) => session.treatment_id === treatmentId)
    .sort(
      (a, b) =>
        a.session_number - b.session_number ||
        a.session_date.localeCompare(b.session_date)
    )
    .map((session) => ({
      id: session.id,
      number: session.session_number,
      packageId: treatmentId,
      date: session.session_date,
      time: session.session_time,
      finish: toFinishStatus(session.finish_status),
      paid: toPaidStatus(session.paid_status),
    }))
}

function getFixedWeekDays(sessions: Session[]): DayOfWeek[] {
  const days = new Set<DayOfWeek>()
  for (const session of sessions) {
    const day = weekdayByNumber[toLocalDate(session.date).getDay()]
    if (day) days.add(day)
  }
  return [...days]
}

export async function getPatientsForList(): Promise<ListPatient[]> {
  const supabase = createClient()
  const [patientsResult, treatmentsResult, sessionsResult, profilesResult] =
    await Promise.all([
      supabase
        .from("patients")
        .select(
          "id, first_name, sur_name, telephone, street, address_number, no_number, neighborhood, reference_house, photo_path, created_at"
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("patient_treatments")
        .select(
          "id, patient_id, treatment_type, price_per_session, planned_sessions, status, package_start_date, created_at"
        )
        .order("created_at", { ascending: true }),
      supabase
        .from("treatment_sessions")
        .select(
          "id, treatment_id, session_number, session_date, session_time, finish_status, paid_status"
        )
        .order("session_date", { ascending: true }),
      supabase
        .from("patient_treatment_profiles")
        .select(
          "patient_id, initial_start_date, sessions_before_current_package"
        ),
    ])

  const queryError =
    patientsResult.error ??
    treatmentsResult.error ??
    sessionsResult.error ??
    profilesResult.error
  if (queryError) throw new Error(queryError.message)

  const patients = (patientsResult.data ?? []) as PatientRow[]
  const treatments = (treatmentsResult.data ?? []) as TreatmentRow[]
  const sessions = (sessionsResult.data ?? []) as TreatmentSessionRow[]
  const profiles = (profilesResult.data ?? []) as TreatmentProfileRow[]
  const profilesByPatient = new Map(profiles.map((row) => [row.patient_id, row]))
  const treatmentsByPatient = new Map<string, TreatmentRow[]>()
  const imageUrlsByPatient = new Map<string, string>()

  const patientsWithPhotos = patients.filter((patient) => patient.photo_path)
  const signedImageResults = await Promise.all(
    patientsWithPhotos.map(async (patient) => {
      const { data, error } = await supabase.storage
        .from("patient-photos")
        .createSignedUrl(patient.photo_path!, 60 * 60)

      if (error) {
        console.error(
          `Não foi possível gerar uma URL temporária para a foto do paciente ${patient.id}:`,
          error.message
        )
        return null
      }

      return { patientId: patient.id, url: data.signedUrl }
    })
  )

  for (const result of signedImageResults) {
    if (result) imageUrlsByPatient.set(result.patientId, result.url)
  }

  for (const treatment of treatments) {
    const existing = treatmentsByPatient.get(treatment.patient_id) ?? []
    existing.push(treatment)
    treatmentsByPatient.set(treatment.patient_id, existing)
  }

  return patients.flatMap((patient): ListPatient[] => {
    const patientTreatments = treatmentsByPatient.get(patient.id) ?? []
    const latestTreatment = patientTreatments.at(-1)

    // Registros em que o cadastro foi iniciado, mas o atendimento não foi salvo,
    // ainda não têm informações suficientes para a tela de detalhes.
    if (!latestTreatment) return []

    const profile = profilesByPatient.get(patient.id)
    const image = imageUrlsByPatient.get(patient.id) ?? null
    const address = {
      telephone: patient.telephone,
      street: patient.street,
      addressNumber: patient.address_number,
      noNumber: patient.no_number,
      neighborhood: patient.neighborhood,
      referenceHouse: patient.reference_house ?? "",
    }

    if (latestTreatment.treatment_type === "package") {
      const packageTreatments = patientTreatments.filter(
        (treatment) => treatment.treatment_type === "package"
      )
      const currentTreatment =
        [...packageTreatments]
          .reverse()
          .find((treatment) =>
            ["active", "in_progress"].includes(treatment.status)
          ) ?? latestTreatment
      const packages = packageTreatments.map((treatment) => {
        const packageSessions = toSessionRows(sessions, treatment.id)
        const startDate =
          treatment.package_start_date ??
          packageSessions[0]?.date ??
          treatment.created_at

        return {
          id: treatment.id,
          startDate: toLocalDate(startDate),
          totalSessions: treatment.planned_sessions,
          migratedSessions:
            treatment.id === currentTreatment.id
              ? (profile?.sessions_before_current_package ?? 0)
              : 0,
          valueSession: Number(treatment.price_per_session),
          fixedWeekDays: getFixedWeekDays(packageSessions),
          defaultTime: packageSessions[0]?.time ?? "08:00",
          current: treatment.id === currentTreatment.id,
        }
      })
      const packageSessions = packageTreatments.flatMap((treatment) =>
        toSessionRows(sessions, treatment.id)
      )
      const patientStartDate =
        profile?.initial_start_date ??
        packages[0]?.startDate.toISOString() ??
        patient.created_at

      return [
        {
          id: patient.id,
          image,
          firstName: patient.first_name,
          surName: patient.sur_name,
          address,
          typeService: "Pacote",
          startDate: toLocalDate(patientStartDate),
          packages,
          session: packageSessions,
        },
      ]
    }

    const singleSessions = toSessionRows(sessions, latestTreatment.id)
    const startDate =
      singleSessions[0]?.date ?? latestTreatment.created_at.slice(0, 10)

    return [
      {
        id: patient.id,
        image,
        firstName: patient.first_name,
        surName: patient.sur_name,
        address,
        typeService: "Sessão avulsa",
        startDate: toLocalDate(startDate),
        separateSessionInfo: {
          priceSession: Number(latestTreatment.price_per_session),
        },
        session: singleSessions,
      },
    ]
  })
}
