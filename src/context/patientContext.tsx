"use client"
import { imageType } from "@/types"
import { PatientType } from "@/types/registerPatientsTypes"
import React, { createContext, useContext, useMemo, useState } from "react"

export type PatientContextType = {
  patientGlobal: PatientType
  setPatientGlobal: React.Dispatch<React.SetStateAction<PatientType>>
  isFormValid: boolean
  image: imageType
  setImage: React.Dispatch<React.SetStateAction<imageType>>
  hasValidPhoto: boolean
  setHasValidPhoto: React.Dispatch<React.SetStateAction<boolean>>
}

const PatientContext = createContext<PatientContextType | null>(null)

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patientGlobal, setPatientGlobal] = useState<PatientType>({
    firstName: "",
    surName: "",
    telephone: "",
    street: "",
    addressNumber: null,
    noNumber: false,
    neighborhood: "Centro",
    referenceHouse: "",
  })
  const [image, setImage] = useState<imageType>([])
  const [hasValidPhoto, setHasValidPhoto] = useState<boolean>(false)

  const isFormValid = useMemo(() => {
    return (
      !!patientGlobal.firstName.trim() &&
      !!patientGlobal.surName.trim() &&
      !!patientGlobal.telephone.trim() &&
      !!patientGlobal.street.trim() &&
      !!patientGlobal.neighborhood.trim() &&
      (patientGlobal.noNumber || patientGlobal.addressNumber !== null) &&
      hasValidPhoto
    )
  }, [patientGlobal, hasValidPhoto])
  console.log("isFormValid:", isFormValid)

  return (
    <PatientContext.Provider
      value={{
        patientGlobal: patientGlobal,
        isFormValid: isFormValid,
        setPatientGlobal: setPatientGlobal,
        image: image,
        setImage: setImage,
        hasValidPhoto: hasValidPhoto,
        setHasValidPhoto: setHasValidPhoto,
      }}
    >
      {children}
    </PatientContext.Provider>
  )
}

export function useGlobalPatient() {
  const context = useContext(PatientContext)
  if (!context) throw new Error("usePatient deve ser usado dentro do provider")
  return context
}
