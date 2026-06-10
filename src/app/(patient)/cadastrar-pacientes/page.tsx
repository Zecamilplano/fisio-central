"use client"

import Button from "@/components/ui/buttonCustom"
import TypeOfService, {
  HeaderFormRegister,
  Profile,
  LineStep,
  StepBall,
  SchedulingSessions,
} from "@/components/patient/"
import { useRegisterPatient } from "@/hook/useRegisterPatient"

function RegisterPatient() {
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
    handleStepClick,
    isFormValid,
    isNextActive,
  } = useRegisterPatient()

  const { selectService, totalSessions } = formTypeService.serviceForm
  // console.log("workflow", formScheduling.isSchedulingFormValid)

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
                <HeaderFormRegister
                  title="Dados do Paciente"
                  subtitle="Preencha as informacoes basicas"
                  icon="person"
                />
              </header>

              <Profile form={formProfile} />

              <footer>
                <Button
                  variant="single"
                  onNext={() => handleNext("step1")}
                  active={isFormValid}
                />
              </footer>
            </>
          )}

          {step2.active && (
            <>
              <header>
                <HeaderFormRegister
                  title="Tipo de  atendimento"
                  subtitle="Escolha entre pacote ou sessoes avulsas"
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
                <HeaderFormRegister
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
