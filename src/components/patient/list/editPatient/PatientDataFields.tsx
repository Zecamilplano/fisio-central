import type { PatientType } from "@/types/registerPatientsTypes"
import { formatTelephone, unformatPhone } from "@/utils/form/phone"
import { characterLimits, fieldClass, type FormErrors } from "./editPatientHelpers"

type PatientDataFieldsProps = {
  form: PatientType
  errors: FormErrors
  onFieldChange: (field: "firstName" | "surName", value: string) => void
  onAddressChange: (
    field: keyof PatientType["address"],
    value: string | number | null | boolean
  ) => void
  onNoNumberChange: (noNumber: boolean) => void
}

// Nome, contato e endereço do paciente
export function PatientDataFields({
  form,
  errors,
  onFieldChange,
  onAddressChange,
  onNoNumberChange,
}: PatientDataFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="space-y-1.5 text-sm font-medium text-slate-700">
        Primeiro nome
        <input
          className={fieldClass(errors.firstName)}
          maxLength={characterLimits.firstName}
          value={form.firstName}
          onChange={(event) => onFieldChange("firstName", event.target.value)}
          aria-invalid={Boolean(errors.firstName)}
        />
        {errors.firstName && <span className="text-xs text-red-600">{errors.firstName}</span>}
        <span className="block text-right text-xs font-normal text-slate-400">
          {form.firstName.length}/{characterLimits.firstName}
        </span>
      </label>
      <label className="space-y-1.5 text-sm font-medium text-slate-700">
        Sobrenome
        <input
          className={fieldClass(errors.surName)}
          maxLength={characterLimits.surName}
          value={form.surName}
          onChange={(event) => onFieldChange("surName", event.target.value)}
          aria-invalid={Boolean(errors.surName)}
        />
        {errors.surName && <span className="text-xs text-red-600">{errors.surName}</span>}
        <span className="block text-right text-xs font-normal text-slate-400">
          {form.surName.length}/{characterLimits.surName}
        </span>
      </label>
      <label className="space-y-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
        Telefone
        <input
          className={fieldClass(errors.telephone)}
          type="tel"
          maxLength={15}
          value={form.address.telephone}
          onChange={(event) =>
            onAddressChange("telephone", formatTelephone(event.target.value))
          }
          aria-invalid={Boolean(errors.telephone)}
        />
        {errors.telephone && <span className="text-xs text-red-600">{errors.telephone}</span>}
        <span className="block text-right text-xs font-normal text-slate-400">
          {unformatPhone(form.address.telephone).length}/11 dígitos
        </span>
      </label>
      <label className="space-y-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
        Rua
        <input
          className={fieldClass(errors.street)}
          maxLength={characterLimits.street}
          value={form.address.street}
          onChange={(event) => onAddressChange("street", event.target.value)}
          aria-invalid={Boolean(errors.street)}
        />
        {errors.street && <span className="text-xs text-red-600">{errors.street}</span>}
        <span className="block text-right text-xs font-normal text-slate-400">
          {form.address.street.length}/{characterLimits.street}
        </span>
      </label>
      <label className="space-y-1.5 text-sm font-medium text-slate-700">
        Número
        <input
          className={fieldClass(errors.addressNumber)}
          type="number"
          min={0}
          max={2147483647}
          step={1}
          disabled={form.address.noNumber}
          value={form.address.noNumber ? "" : form.address.addressNumber ?? ""}
          onChange={(event) =>
            onAddressChange(
              "addressNumber",
              event.target.value === "" ? null : Number(event.target.value)
            )
          }
          aria-invalid={Boolean(errors.addressNumber)}
        />
        {errors.addressNumber && <span className="text-xs text-red-600">{errors.addressNumber}</span>}
        <span className="flex items-center gap-2 font-normal">
          <input
            type="checkbox"
            checked={form.address.noNumber}
            onChange={(event) => onNoNumberChange(event.target.checked)}
          />
          Sem número
        </span>
      </label>
      <label className="space-y-1.5 text-sm font-medium text-slate-700">
        Bairro
        <input
          className={fieldClass(errors.neighborhood)}
          maxLength={characterLimits.neighborhood}
          value={form.address.neighborhood}
          onChange={(event) => onAddressChange("neighborhood", event.target.value)}
          aria-invalid={Boolean(errors.neighborhood)}
        />
        {errors.neighborhood && <span className="text-xs text-red-600">{errors.neighborhood}</span>}
        <span className="block text-right text-xs font-normal text-slate-400">
          {form.address.neighborhood.length}/{characterLimits.neighborhood}
        </span>
      </label>
      <label className="space-y-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
        Ponto de referência <span className="font-normal text-slate-400">(opcional)</span>
        <textarea
          className={fieldClass(errors.referenceHouse)}
          rows={3}
          maxLength={characterLimits.referenceHouse}
          value={form.address.referenceHouse}
          onChange={(event) => onAddressChange("referenceHouse", event.target.value)}
        />
        {errors.referenceHouse && <span className="text-xs text-red-600">{errors.referenceHouse}</span>}
        <span className="block text-right text-xs font-normal text-slate-400">
          {form.address.referenceHouse.length}/{characterLimits.referenceHouse}
        </span>
      </label>
    </div>
  )
}
