import { HeartPulse } from "lucide-react"

import type {
  TemporaryWarning,
  VitalSigns,
  WarningField,
} from "../evolution.types"
import EvolutionSection from "./evolutionSection"
import { cn } from "tailwind-variants"

type EvolutionVitalSignsSectionProps = {
  vitalSigns: VitalSigns
  temporaryWarning: TemporaryWarning | null
  onChange: (field: keyof VitalSigns, value: string) => void
  showWarning: (field: WarningField, message: string) => void
}

const VITAL_SIGNS_MAX_LENGTH: Record<keyof VitalSigns, number> = {
  bloodPressure: 7,
  heartRate: 3,
  respiratoryRate: 2,
  oxygenSaturation: 3,
  observations: 500,
}

export default function EvolutionVitalSignsSection({
  vitalSigns,
  temporaryWarning,
  onChange,
  showWarning,
}: EvolutionVitalSignsSectionProps) {
  return (
    <EvolutionSection
      title="Sinais vitais"
      icon={<HeartPulse size={20} />}
      optional="opcional"
    >
      <div className="space-y-3">
        <VitalField
          field="bloodPressure"
          label="Pressão arterial"
          value={vitalSigns.bloodPressure}
          maxLength={VITAL_SIGNS_MAX_LENGTH.bloodPressure}
          onChange={(value) => onChange("bloodPressure", value)}
          showWarning={showWarning}
          warning={
            temporaryWarning?.field === "bloodPressure"
              ? temporaryWarning.message
              : undefined
          }
        />
        {temporaryWarning?.field === "bloodPressure" && (
          <p className="mt-2 text-sm text-red-500">
            {temporaryWarning.message}
          </p>
        )}

        <VitalField
          field="heartRate"
          label="Frequência cardíaca"
          value={vitalSigns.heartRate}
          maxLength={VITAL_SIGNS_MAX_LENGTH.heartRate}
          onChange={(value) => onChange("heartRate", value)}
          showWarning={showWarning}
        />
        {temporaryWarning?.field === "heartRate" && (
          <p className="mt-2 text-sm text-red-500">
            {temporaryWarning.message}
          </p>
        )}

        <VitalField
          field="respiratoryRate"
          label="Frequência respiratória"
          value={vitalSigns.respiratoryRate}
          maxLength={VITAL_SIGNS_MAX_LENGTH.respiratoryRate}
          onChange={(value) => onChange("respiratoryRate", value)}
          showWarning={showWarning}
        />
        {temporaryWarning?.field === "respiratoryRate" && (
          <p className="mt-2 text-sm text-red-500">
            {temporaryWarning.message}
          </p>
        )}

        <VitalField
          field="oxygenSaturation"
          label="Saturação"
          value={vitalSigns.oxygenSaturation}
          maxLength={VITAL_SIGNS_MAX_LENGTH.oxygenSaturation}
          onChange={(value) => onChange("oxygenSaturation", value)}
          showWarning={showWarning}
        />
        {temporaryWarning?.field === "oxygenSaturation" && (
          <p className="mt-2 text-sm text-red-500">
            {temporaryWarning.message}
          </p>
        )}
      </div>
      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Observações
        </span>

        <textarea
          value={vitalSigns.observations}
          maxLength={VITAL_SIGNS_MAX_LENGTH.observations}
          onChange={(event) => onChange("observations", event.target.value)}
          onKeyDown={(event) => {
            if (
              vitalSigns.observations.length >=
                VITAL_SIGNS_MAX_LENGTH.observations &&
              event.key !== "Backspace" &&
              event.key !== "Delete" &&
              event.key !== "ArrowLeft" &&
              event.key !== "ArrowRight" &&
              event.key !== "ArrowUp" &&
              event.key !== "ArrowDown" &&
              event.key !== "Tab" &&
              event.key !== "Shift" &&
              event.key !== "Control"
            ) {
              showWarning(
                "observations",
                `Limite máximo de ${VITAL_SIGNS_MAX_LENGTH.observations} caracteres atingido.`
              )
            }
          }}
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </label>

      <p
        className={cn(
          "text-xs text-right",
          vitalSigns.observations.length >= VITAL_SIGNS_MAX_LENGTH.observations
            ? "text-red-500"
            : vitalSigns.observations.length >=
                VITAL_SIGNS_MAX_LENGTH.observations * 0.9
              ? "text-yellow-600"
              : "text-slate-500"
        )}
      >
        {vitalSigns.observations.length}/{VITAL_SIGNS_MAX_LENGTH.observations}
      </p>

      {temporaryWarning?.field === "observations" && (
        <p className="mt-2 text-sm text-red-500">{temporaryWarning.message}</p>
      )}
    </EvolutionSection>
  )
}

type VitalSignsField = keyof VitalSigns

type VitalFieldProps = {
  field: VitalSignsField
  label: string
  value: string
  maxLength: number
  warning?: string
  onChange: (value: string) => void
  showWarning: (field: WarningField, message: string) => void
}

function VitalField({
  field,
  label,
  value,
  maxLength,
  warning,
  onChange,
  showWarning,
}: VitalFieldProps) {
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const isControlKey =
      event.key === "Backspace" ||
      event.key === "Delete" ||
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight" ||
      event.key === "Tab"

    if (isControlKey) return

    if (value.length === maxLength) {
      showWarning(field, `Limite máximo de ${maxLength} caracteres atingido.`)
    }
  }

  return (
    <label className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_180px] sm:items-center">
      <span className="text-sm text-slate-700">{label}</span>

      <input
        type="text"
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(
          "rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition",
          warning
            ? "animate-shake border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        )}
      />
    </label>
  )
}
