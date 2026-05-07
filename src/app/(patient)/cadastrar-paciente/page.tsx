"use client"

import Button from "@/components/buttonCustom"
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
    <main className="bg-green-700 flex-1 flex justify-center items-center">
      <section className="bg-white rounded-md px-2 py-2 m-3 w-full max-w-210 h-full flex flex-col items-center  ">
        {/*step*/}
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

        <form ref={formRef} className="flex flex-col gap-6 px-2">
          {step1.active && (
            <>
              <HeaderFormRegister
                title="Dados do Paciente"
                subtitle="Preencha as informacoes basicas"
                icon="person"
              />
              <Profile form={formProfile} />
              <Button
                variant="single"
                onNext={() => handleNext("step1")}
                active={isFormValid}
              />
            </>
          )}

          {step2.active && (
            <>
              <HeaderFormRegister
                title="Tipo de  atendimento"
                subtitle="Escolha entre pacote ou sessoes avulsas"
                icon="square"
              />
              <TypeOfService form={formTypeService} />
              <Button
                variant="double"
                onPrev={() => handlePrev("step2", "step1")}
                onNext={() => handleNext("step2")}
                active={isNextActive}
              />
            </>
          )}

          {step3.active && (
            <>
              <HeaderFormRegister
                title={`${selectService === "pacote" ? "Agenda sessões do pacote" : "Agenda de sessão avulsas"} `}
                subtitle={`${(totalSessions ?? 0) ? "Adicione até " + totalSessions + " sessões no pacote" : "Adicione a primeira sessão"}`}
                icon="square"
              />
              <SchedulingSessions form={formScheduling} />
              <Button
                variant="finish"
                onPrev={() => handlePrev("step3", "step2")}
                active={formScheduling.isSchedulingFormValid}
              />
            </>
          )}
        </form>
      </section>
    </main>
  )
}

export default RegisterPatient
