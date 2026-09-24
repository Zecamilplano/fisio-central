import {
  AlertTriangle,
  ArrowRightCircle,
  Calendar,
  ClipboardList,
  Clock,
  Dumbbell,
  HeartPulse,
  Pencil,
  Target,
  User,
} from "lucide-react"

import type { EvolutionFormData } from "./evolution.types"
import type { ListPatient, Session } from "@/types"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

type EvolutionViewProps = {
  evolution: EvolutionFormData
  patient: Pick<ListPatient, "name" | "typeService">
  session: Pick<Session, "date" | "time">
  defaultTime: string
  onEdit: () => void
}

export default function EvolutionView({
  evolution,
  patient,
  session,
  defaultTime,
  onEdit,
}: EvolutionViewProps) {
  const sessionDate = parseISO(session.date)
  const sessionWeekDay = format(sessionDate, "EEEE", { locale: ptBR })
    .replace("-feira", "")
    .replace(/^./, (letter) => letter.toUpperCase())

  const {
    bloodPressure,
    heartRate,
    respiratoryRate,
    oxygenSaturation,
    observations,
  } = evolution.vitalSigns
  const hasContentVitalSigns = [
    bloodPressure,
    heartRate,
    respiratoryRate,
    oxygenSaturation,
    observations,
  ].every((value) => value.trim())

  return (
    <div className="rounded-3xl bg-white p-5 shadow-2xl md:p-8">
      {/* Título */}
      <header className="mb-6">
        <h1 className="text-center text-2xl font-bold tracking-tight text-emerald-700 md:text-3xl">
          Evolução Fisioterapêutica
        </h1>
      </header>

      {/* Informações do paciente */}
      <section className="mb-6 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <User className="h-7 w-7 text-emerald-700" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800 md:text-xl">
              {patient.name}
            </h2>

            <p className="text-sm text-slate-500">{patient.typeService}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-slate-700 sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <Calendar size={17} className="text-emerald-700" />
              <span>{format(sessionDate, "dd/MM/yyyy")}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock size={17} className="text-emerald-700" />
              <span>{session.time ?? defaultTime}</span>
            </div>

            <div className="flex items-center">
              <span>{sessionWeekDay}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onEdit}
            className="flex items-center justify-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 font-medium text-emerald-700 transition hover:border-emerald-500 hover:bg-emerald-100 active:scale-95 active:border-emerald-600 active:bg-emerald-200 active:shadow-inner"
          >
            <Pencil size={16} />
            Editar
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Objetivos */}
        <ContentSection title="Objetivo da sessão" icon={<Target size={20} />}>
          <ListContent
            items={evolution.goals}
            emptyMessage="Nenhum objetivo registrado."
          />
        </ContentSection>

        {/* Intercorrências */}
        <ContentSection
          title="Intercorrências"
          icon={<AlertTriangle size={20} />}
        >
          <div className="rounded-xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
            {evolution.complications?.trim() ||
              "Nenhuma intercorrência registrada."}
          </div>
        </ContentSection>

        {/* Exercícios */}
        <ContentSection
          title="Exercícios realizados"
          icon={<Dumbbell size={20} />}
        >
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-emerald-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-emerald-800">
                    Exercício
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-emerald-800">
                    Séries / Carga
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 text-slate-600">
                {evolution.exercises.length > 0 ? (
                  evolution.exercises.map((exercise) => (
                    <tr key={exercise.id}>
                      <td className="px-4 py-3">
                        {exercise.name.trim() || "Não informado"}
                      </td>

                      <td className="px-4 py-3">
                        {exercise.details.trim() || "Não informado"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-5 text-center text-slate-400"
                    >
                      Nenhum exercício registrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ContentSection>

        {/* Sinais vitais */}
        {hasContentVitalSigns && (
          <ContentSection
            title="Sinais vitais"
            icon={<HeartPulse size={20} />}
            optional
          >
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <VitalRow
                label="Pressão arterial"
                value={evolution.vitalSigns.bloodPressure}
              />

              <VitalRow
                label="Frequência cardíaca"
                value={evolution.vitalSigns.heartRate}
              />

              <VitalRow
                label="Frequência respiratória"
                value={evolution.vitalSigns.respiratoryRate}
              />

              <VitalRow
                label="Saturação"
                value={evolution.vitalSigns.oxygenSaturation}
                last
              />
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
              <p className="mb-1 text-xs font-medium uppercase text-slate-400">
                Observações
              </p>

              <p className="text-sm leading-6 text-slate-600">
                {evolution.vitalSigns.observations}
              </p>
            </div>
          </ContentSection>
        )}

        {/* Condutas */}
        <ContentSection title="Conduta" icon={<ClipboardList size={20} />}>
          <ListContent
            items={evolution.conducts}
            emptyMessage="Nenhuma conduta registrada."
          />
        </ContentSection>

        {/* Orientações */}
        <ContentSection
          title="Orientações"
          icon={<ArrowRightCircle size={20} />}
        >
          <ListContent
            items={evolution.orientations}
            emptyMessage="Nenhuma orientação registrada."
          />
        </ContentSection>

        {/* Evolução */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-3 text-lg font-semibold text-emerald-700">
            Evolução / Melhora
          </h3>

          <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
            {evolution.progress.trim() ||
              "Nenhuma evolução registrada para esta sessão."}
          </p>
        </section>

        {/* Escala de dor */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-emerald-700">
            Escala de dor (EVA)
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PainValue
              label="Antes da sessão"
              value={evolution.painBefore}
              variant="before"
            />

            <PainValue
              label="Depois da sessão"
              value={evolution.painAfter}
              variant="after"
            />
          </div>

          <div className="mt-5">
            <div className="h-2 rounded-full bg-linear-to-r from-emerald-500 via-amber-400 to-red-500" />

            <div className="mt-2 flex justify-between text-xs text-slate-400">
              <span>0 — Sem dor</span>
              <span>10 — Pior dor</span>
            </div>
          </div>
        </section>

        {/* Próximas condutas */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-emerald-700">
            Próxima sessão / Conduta
          </h3>

          <ListContent
            items={evolution.nextConducts}
            emptyMessage="Nenhuma próxima conduta registrada."
          />
        </section>

        {/* Profissional */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <User className="h-7 w-7 text-emerald-700" />
            </div>

            <div>
              <p className="text-sm text-slate-500">Profissional responsável</p>

              <h3 className="text-lg font-semibold text-slate-800">
                Dra. Ana Carolina
              </h3>

              <p className="text-sm text-slate-600">Fisioterapeuta</p>

              <p className="text-xs text-slate-400">CREFITO 123456-F</p>
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center text-xs leading-5 text-slate-600 md:text-sm">
        Este registro faz parte do prontuário do paciente e deve ser mantido em
        sigilo profissional.
      </footer>
    </div>
  )
}

type ContentSectionProps = {
  title: string
  icon: React.ReactNode
  optional?: boolean
  children: React.ReactNode
}

function ContentSection({
  title,
  icon,
  optional = false,
  children,
}: ContentSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-emerald-600">{icon}</span>

        <h3 className="text-base font-semibold text-slate-800 md:text-lg">
          {title}
        </h3>

        {optional && <span className="text-xs text-slate-400">(opcional)</span>}
      </div>

      {children}
    </section>
  )
}

type ListContentProps = {
  items: string[]
  emptyMessage: string
}

function ListContent({ items, emptyMessage }: ListContentProps) {
  const validItems = items.filter((item) => item.trim())

  if (validItems.length === 0) {
    return <p className="text-sm text-slate-400">{emptyMessage}</p>
  }

  return (
    <ul className="text-wrap list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
      {validItems.map((item, index) => (
        <li key={`${item}-${index}`} className="wrap-anywhere">
          {item}
        </li>
      ))}
    </ul>
  )
}

type VitalRowProps = {
  label: string
  value: string
  last?: boolean
}

function VitalRow({ label, value, last = false }: VitalRowProps) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3 text-sm ${
        last ? "" : "border-b border-slate-200"
      }`}
    >
      <span className="text-slate-600">{label}</span>

      <strong className="text-right font-medium text-slate-800">
        {value.trim() || "Não informado"}
      </strong>
    </div>
  )
}

type PainValueProps = {
  label: string
  value: number | null
  variant: "before" | "after"
}

function PainValue({ label, value, variant }: PainValueProps) {
  const isBefore = variant === "before"

  return (
    <div
      className={`rounded-xl border p-4 text-center ${
        isBefore
          ? "border-red-100 bg-red-50"
          : "border-emerald-100 bg-emerald-50"
      }`}
    >
      <p className="mb-1 text-sm text-slate-500">{label}</p>

      <span
        className={`text-3xl font-bold ${
          isBefore ? "text-red-500" : "text-emerald-600"
        }`}
      >
        {value === null ? "—" : `${value}/10`}
      </span>
    </div>
  )
}
