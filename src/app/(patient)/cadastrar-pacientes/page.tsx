"use client"

import Button from "@/components/ui/buttonCustom"
import TypeOfService, {
  SubHeaderFormRegister,
  Profile,
  LineStep,
  StepBall,
  SchedulingSessions,
} from "@/components/patient/"
import { useRegisterPatient } from "@/hook/useRegisterPatient"
import useImageInput from "@/hook/useImageInput"
import { deletePatientPermanently } from "@/services/patients/patientRepository"
import { ProgressActionButton } from "@/components/ui/progressActionButton"
import { useEffect, useRef, useState } from "react"
import { signInDevUser } from "@/actions/devAuth"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

type ClearMode =
  | { kind: "all" }
  | {
      kind: "current"
      step: 1 | 2 | 3
      hasPatientOnServer: boolean
    }

function RegisterPatient() {
  const router = useRouter()
  const {
    step1,
    step2,
    step3,
    formRef,
    formProfile,
    formTypeService,
    formScheduling,
    handlePrev,
    handleNext,
    handleSavePackageSchedule,
    resetRegistration,
    clearCurrentStep,
    handleStepClick,
    isFormValid,
    isNextActive,
    isSavingPatient,
    isSavingService,
    isRestoring,
  } = useRegisterPatient()

  const { selectService, totalSessions } = formTypeService.serviceForm
  const imageInput = useImageInput()
  const [clearMode, setClearMode] = useState<ClearMode | null>(null)
  const [isClearingRegistration, setIsClearingRegistration] = useState(false)
  const isBusy =
    isSavingPatient || isSavingService || formScheduling.isSavingSchedule

  async function handleRegisterAndAdd() {
    if (!(await handleSavePackageSchedule())) return
    clearRegistrationDraft()
    imageInput.removeImage()
    resetRegistration()
  }

  async function handleRegisterAndViewPatient() {
    if (!(await handleSavePackageSchedule())) return
    const patientId = localStorage.getItem("createdPatientId")
    if (!patientId) return
    clearRegistrationDraft()
    imageInput.removeImage()
    resetRegistration()
    router.push(`/listar-pacientes?patientId=${encodeURIComponent(patientId)}`)
  }

  function clearRegistrationDraft() {
    localStorage.removeItem("createdPatientId")
    localStorage.removeItem("patientRegistrationStep")
    localStorage.removeItem("formProfile")
    localStorage.removeItem("typeServiceForm")
    localStorage.removeItem("schedulingForm")
  }

  async function handleConfirmClear() {
    if (isBusy || isClearingRegistration) return

    setIsClearingRegistration(true)
    try {
      let photoCleanupError: string | undefined
      let resetAll = false

      if (clearMode?.kind === "all") {
        const patientId = localStorage.getItem("createdPatientId")
        const result = patientId
          ? await deletePatientPermanently(patientId)
          : undefined
        photoCleanupError = result?.photoCleanupError

        clearRegistrationDraft()
        imageInput.removeImage()
        resetRegistration()
        resetAll = true
      } else if (clearMode?.kind === "current") {
        const result = await clearCurrentStep()
        photoCleanupError = result.photoCleanupError
        resetAll = result.resetAll

        if (result.resetAll) {
          clearRegistrationDraft()
        }
        if (clearMode.step === 1) {
          imageInput.removeImage()
        }
      }

      setClearMode(null)

      if (photoCleanupError) {
        toast.warn(
          "O cadastro foi apagado, mas não foi possível remover a foto do armazenamento."
        )
      } else {
        toast.success(
          resetAll
            ? "Todo o cadastro foi limpo."
            : "Os dados desta etapa foram limpos."
        )
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `Não foi possível limpar os dados: ${error.message}`
          : "Não foi possível limpar os dados do cadastro."
      )
    } finally {
      setIsClearingRegistration(false)
    }
  }

  function openCurrentCleanup() {
    const step: 1 | 2 | 3 = step1.active ? 1 : step2.active ? 2 : 3
    setClearMode({
      kind: "current",
      step,
      hasPatientOnServer: Boolean(localStorage.getItem("createdPatientId")),
    })
  }

  function renderCleanupActions() {
    return (
      <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={openCurrentCleanup}
          disabled={isBusy || isRestoring || isClearingRegistration}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Limpar formulário atual
        </button>
        <button
          type="button"
          onClick={() => setClearMode({ kind: "all" })}
          disabled={isBusy || isRestoring || isClearingRegistration}
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Limpar todo o cadastro
        </button>
      </div>
    )
  }

  const devAuthStarted = useRef(false)

  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || devAuthStarted.current) {
      return
    }

    devAuthStarted.current = true

    void signInDevUser().then((result) => {
      if (!result.success) {
        console.error(
          "Falha na autênticação de desenvolvimento:",
          result.message
        )
        return
      }
      console.log("Logado")
    })
  }, [])

  return (
    <section className=" flex justify-center items-center">
      <section
        className="bg-white rounded-md px-2 py-2 m-3 w-full max-w-210 h-full flex flex-col items-center"
        aria-labelledby="titulo-cadastro"
      >
        <div className="mt-4 flex w-full max-w-180 items-center justify-center px-3">
          <nav aria-label="Etapas do cadastro">
            <ol className="flex items-center">
              <StepBall
                number={1}
                step={step1}
                onClick={() => handleStepClick("step1")}
                disabled={isBusy || isRestoring}
              />

              <LineStep completed={step1.completed} />

              <StepBall
                number={2}
                step={step2}
                onClick={() => handleStepClick("step2")}
                disabled={isBusy || isRestoring}
              />

              <LineStep completed={step2.completed} />

              <StepBall
                number={3}
                step={step3}
                onClick={() => handleStepClick("step3")}
                disabled={isBusy || isRestoring}
              />
            </ol>
          </nav>

        </div>

        <form ref={formRef} className="flex flex-col gap-6 px-2">
          {step1.active && (
            <>
              <header>
                <SubHeaderFormRegister
                  img={imageInput}
                  title="Dados do Paciente"
                  subtitle="Preencha as informacoes basicas"
                  icon="person"
                />
              </header>

              <Profile form={formProfile} />

              <footer>
                {renderCleanupActions()}
                <Button
                  variant="single"
                  onNext={() => handleNext("step1", imageInput.image[0]?.file)}
                  active={isFormValid}
                  isSubmitting={isSavingPatient}
                />
              </footer>
            </>
          )}

          {step2.active && (
            <>
              <header>
                <SubHeaderFormRegister
                  title="Tipo de atendimento"
                  subtitle="Escolha entre pacote ou sessões avulsas"
                  icon="square"
                />
              </header>

              <TypeOfService form={formTypeService} />

              <footer>
                {renderCleanupActions()}
                <Button
                  variant="double"
                  onPrev={() => handlePrev("step2", "step1")}
                  onNext={() => handleNext("step2")}
                  active={isNextActive}
                  isSubmitting={isSavingService}
                />
              </footer>
            </>
          )}

          {step3.active && (
            <>
              <header>
                <SubHeaderFormRegister
                  title={`${
                    selectService === "pacote"
                      ? "Agenda sessões do pacote"
                      : "Agenda de sessão avulsas"
                  } `}
                  subtitle={`${
                    (totalSessions ?? 0)
                      ? "Adicione até " + totalSessions + " sessões no pacote"
                      : "Adicione a primeira sessão"
                  }`}
                  icon="square"
                />
              </header>

              <SchedulingSessions form={formScheduling} />

              <footer>
                {renderCleanupActions()}
                <Button
                  variant="finish"
                  onPrev={() => handlePrev("step3", "step2")}
                  onRegisterAdd={handleRegisterAndAdd}
                  onRegisterViewPatient={handleRegisterAndViewPatient}
                  active={formScheduling.isSchedulingFormValid}
                  isSubmitting={formScheduling.isSavingSchedule}
                />
              </footer>
            </>
          )}
        </form>
      </section>

      {clearMode && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isClearingRegistration) {
              setClearMode(null)
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="clear-registration-title"
            aria-describedby="clear-registration-description"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h2
              id="clear-registration-title"
              className="text-lg font-semibold text-slate-900"
            >
              {clearMode.kind === "all"
                ? "Limpar todo o cadastro?"
                : "Limpar o formulário atual?"}
            </h2>
            <p
              id="clear-registration-description"
              className="mt-2 text-sm leading-6 text-slate-600"
            >
              {clearMode.kind === "all"
                ? "O formulário será apagado e, se o paciente já foi salvo, os dados dele, atendimentos, sessões e evoluções também serão excluídos permanentemente do servidor."
                : clearMode.step === 1 && clearMode.hasPatientOnServer
                  ? "Os dados pessoais já foram enviados. Para limpar esta etapa, o paciente e todos os dados relacionados serão removidos permanentemente do servidor."
                  : clearMode.step === 2 && clearMode.hasPatientOnServer
                    ? "O atendimento desta etapa e os dados de agenda relacionados serão removidos do servidor. O cadastro do paciente será mantido."
                    : clearMode.step === 3 && clearMode.hasPatientOnServer
                      ? "A agenda desta etapa será limpa no navegador e os dados de sessões que já tenham sido enviados serão removidos. O paciente e o atendimento serão mantidos."
                      : "Os dados desta etapa serão limpos deste formulário e do rascunho local. As outras etapas serão mantidas."}
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setClearMode(null)}
                disabled={isClearingRegistration}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <ProgressActionButton
                type="button"
                onClick={handleConfirmClear}
                disabled={isClearingRegistration}
                loading={isClearingRegistration}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
              >
                {isClearingRegistration
                  ? "Limpando..."
                  : clearMode.kind === "all"
                    ? "Apagar tudo"
                    : "Limpar esta etapa"}
              </ProgressActionButton>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}

export default RegisterPatient
