import { ListPatient } from "@/types"

type PatientContactGridProps = {
  contactInfo: ListPatient["contactInfo"]
}
export function PatientContactGrid({ contactInfo }: PatientContactGridProps) {
  return (
    <section className="grid w-full grid-cols-1 gap-4 pb-6 sm:grid-cols-2 xl:grid-cols-3">
      {Object.values(contactInfo).map((info, index) => {
        const Icon = info.Icon

        return (
          <article
            key={index}
            className="flex flex-col items-center justify-center gap-2 rounded-md bg-white py-4"
          >
            <Icon color="#FFA726" size={32} />

            <h3 className="text-base text-[#64748B] capitalize">
              {info.label}
            </h3>

            <p className="px-3 text-center text-base font-medium wrap-break-words text-[#1A1A1A]">
              {info.value}
            </p>
          </article>
        )
      })}
    </section>
  )
}
