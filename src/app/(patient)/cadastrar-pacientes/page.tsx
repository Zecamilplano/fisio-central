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
import { useEffect, useRef } from "react"
import { signInDevUser } from "@/actions/devAuth"
import { useRouter } from "next/navigation"

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
    handleStepClick,
    isFormValid,
    isNextActive,
  } = useRegisterPatient()

  const { selectService, totalSessions } = formTypeService.serviceForm
  const imageInput = useImageInput()

  async function handleRegisterAndAdd() {
    if (!(await handleSavePackageSchedule())) return
    clearRegistrationDraft()
    router.push("/listar-pacientes")
  }

  async function handleRegisterAndViewPatient() {
    const patientId = localStorage.getItem("createdPatientId")
    if (!patientId || !(await handleSavePackageSchedule())) return
    clearRegistrationDraft()
    router.push(`/listar-pacientes?patientId=${encodeURIComponent(patientId)}`)
  }

  function clearRegistrationDraft() {
    localStorage.removeItem("createdPatientId")
    localStorage.removeItem("patientRegistrationStep")
    localStorage.removeItem("formProfile")
    localStorage.removeItem("typeServiceForm")
    localStorage.removeItem("schedulingForm")
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
        {/* step */}
        <nav aria-label="Etapas do cadastro">
          <ol className="flex items-center mt-6">
            <StepBall
              number={1}
              step={step1}
              onClick={() => handleStepClick("step1")}
            />

            <LineStep completed={step1.completed} />

            <StepBall
              number={2}
              step={step2}
              onClick={() => handleStepClick("step2")}
            />

            <LineStep completed={step2.completed} />

            <StepBall
              number={3}
              step={step3}
              onClick={() => handleStepClick("step3")}
            />
          </ol>
        </nav>

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
                <Button
                  variant="single"
                  onNext={() => handleNext("step1", imageInput.image[0]?.file)}
                  active={isFormValid}
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
                <Button
                  variant="double"
                  onPrev={() => handlePrev("step2", "step1")}
                  onNext={() => handleNext("step2")}
                  active={isNextActive}
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
                <Button
                  variant="finish"
                  onPrev={() => handlePrev("step3", "step2")}
                  onRegisterAdd={handleRegisterAndAdd}
                  onRegisterViewPatient={handleRegisterAndViewPatient}
                  active={formScheduling.isSchedulingFormValid}
                />
              </footer>
            </>
          )}
        </form>
      </section>
    </section>
  )
}

export default RegisterPatient
