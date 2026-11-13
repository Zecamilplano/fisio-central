import { create } from "zustand"

type ClinicState = {
  status: "loading" | "needs-clinic" | "ready"
  clinicId: string | null
  role: string | null
  setReady: (clinicId: string, role: string) => void
  setNeedsClinic: () => void
  reset: () => void
}

export const useClinicStore = create<ClinicState>((set) => ({
  status: "loading",
  clinicId: null,
  role: null,
  setReady: (clinicId, role) => set({ status: "ready", clinicId, role }),
  setNeedsClinic: () =>
    set({ status: "needs-clinic", clinicId: null, role: null }),
  reset: () => set({ status: "loading", clinicId: null, role: null }),
}))

// para componentes dentro do ClinicGate, onde o clinicId sempre existe
export function useClinicId() {
  const id = useClinicStore((s) => s.clinicId)
  if (!id) throw new Error("clinicId indisponível fora do ClinicGate")
  return id
}
