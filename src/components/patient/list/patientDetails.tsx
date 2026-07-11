import type { ListPatient } from "@/types"
import Image from "next/image"
import { PencilLine } from "lucide-react"
import { PatientContactGrid } from "./patientContactGrid"
import { CurrentPackageCard } from "../package/currentPackageCard"
import { SeparateSessionInfoCard } from "./separateSessionInfoCard"
import { PackageSession } from "../session/packageSession"
import { useEffect, useState } from "react"

type PatientDetailsProps = {
  patient: ListPatient
  setListPatient: React.Dispatch<React.SetStateAction<ListPatient[]>>
}

export function PatientDetails({
  patient,
  setListPatient,
}: PatientDetailsProps) {
  const [currentPackageIndex, setCurrentPackageIndex] = useState(0)

  useEffect(() => {
    if (patient.typeService !== "Pacote") {
      setCurrentPackageIndex(0)
      return
    }

    const currentIndex = patient.packages.findIndex((item) => item.current)

    setCurrentPackageIndex(
      currentIndex >= 0 ? currentIndex : patient.packages.length - 1
    )
  }, [patient])

  return (
    <section className="font-open-sans flex w-full flex-col gap-6 overflow-y-hidden rounded-md bg-[#F4F6F5] md:rounded-l-none md:rounded-r-md lg:overflow-y-auto">
      <div className="h-full overflow-y-auto px-3 py-4">
        <header className="flex flex-col justify-between gap-4 pb-5 md:flex-row md:items-center">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Image
              src={patient.image ?? "/person.png"}
              width={110}
              height={110}
              alt="Foto de perfil"
              className="rounded-full"
            />

            <div className="text-center sm:text-left">
              <h2 className="text-xl text-[#2D3748] md:text-2xl">
                {patient.name}
              </h2>

              <p className="mt-2 rounded-4xl bg-[#FFA726]/20 px-5 py-2 text-center text-[#FFA726]">
                {patient.typeService}
              </p>
            </div>
          </div>

          <button className="self-end md:self-auto">
            <PencilLine size={28} color="#737373" />
          </button>
        </header>

        {/* ContactGrid */}
        <PatientContactGrid contactInfo={patient.contactInfo} />

        {/* CurrentPackageCard */}
        {patient.typeService === "Pacote" && (
          <CurrentPackageCard
            patient={patient}
            currentPackageIndex={currentPackageIndex}
            setCurrentPackageIndex={setCurrentPackageIndex}
          />
        )}

        {/*sessões */}
        {/* sessões avulsa */}
        {patient.typeService === "Sessão avulsa" && (
          <SeparateSessionInfoCard patient={patient} />
        )}

        {/* Sessões em pacote */}
        <PackageSession
          patient={patient}
          setListPatient={setListPatient}
          currentPackageIndex={currentPackageIndex}
        />
      </div>
    </section>
  )
}
