import { EvolutionFormData } from "./evolution.types"

export function createEmptyEvolution(): EvolutionFormData {
  return {
    goals: [""],
    complications: "",

    exercises: [
      {
        id: crypto.randomUUID(),
        name: "",
        details: "",
      },
    ],

    vitalSigns: {
      bloodPressure: "",
      heartRate: "",
      respiratoryRate: "",
      oxygenSaturation: "",
      observations: "",
    },

    conducts: [""],
    orientations: [""],
    progress: "",
    painBefore: null,
    painAfter: null,
    nextConducts: [""],
  }
}
