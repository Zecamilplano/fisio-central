import { PatientAddressType } from "@/types/registerPatientsTypes"
import { MapPinHouse, Phone, Send } from "lucide-react"

type PatientContactGridProps = {
  address: PatientAddressType
}
export function PatientContactGrid({ address }: PatientContactGridProps) {
  const addressValue = [
    address.street?.trim(),
    !address.noNumber && address.addressNumber != null
      ? String(address.addressNumber)
      : "",
    address.neighborhood?.trim(),
  ]
    .filter(Boolean)
    .join(", ")

  const contactInfo = [
    { Icon: Phone, label: "Telefone", value: address.telephone },
    { Icon: MapPinHouse, label: "Endereço", value: addressValue },
    { Icon: Send, label: "Referência", value: address.referenceHouse },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 bg-white border border-slate-200 rounded-[10px] mb-6">
      {contactInfo.map((info, index) => {
        const Icon = info.Icon
        const isTelephone = info.label === "Telefone"
        const isReference = info.label === "Referência"
        const displayValue = info.value?.trim() ? info.value : "—"

        return (
          <div
            key={index}
            className={`flex min-w-0 items-start gap-3.5 border-b border-slate-200 p-4 ${
              isTelephone ? "md:border-r md:border-slate-200" : ""
            } ${isReference ? "md:col-span-2 border-b-0" : ""}`}
          >
            <Icon
              color="#FFA726"
              size={28}
              className="size-7 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm text-slate-500">{info.label}</h3>
              <p
                className={`mt-0.5 text-[15px] [overflow-wrap:anywhere] ${
                  displayValue === "—" ? "text-slate-400" : "text-slate-900"
                } ${isReference ? "whitespace-pre-line" : ""}`}
              >
                {displayValue}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
