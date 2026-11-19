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
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

// campo onde o teclado já tem função própria (digitar, mover o cursor,
// trocar a opção marcada): nesses casos as setas não trocam de etapa
function isFormControl(target: EventTarget | null) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  )
}

// campo de texto com conteúdo: Ctrl+Backspace ali apaga a palavra anterior
// (comportamento nativo), então o atalho de limpar não é acionado
function isTextFieldWithContent(target: EventTarget | null) {
  if (target instanceof HTMLTextAreaElement) return target.value.length > 0
  if (!(target instanceof HTMLInputElement)) return false
  const nonText = ["checkbox", "radio", "button", "submit", "file", "range", "color"]
  return !nonText.includes(target.type) && target.value.length > 0
}

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

  function clearRegistrationDraft() {
    localStorage.removeItem("createdPatientId")
    localStorage.removeItem("patientRegistrationStep")
    localStorage.removeItem("formProfile")
    localStorage.removeItem("typeServiceForm")
    localStorage.removeItem("schedulingForm")
  }

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

  // Atalhos do cadastro (funcionam com o foco em qualquer lugar, inclusive campos):
  //   Ctrl+Enter              → etapas 1 e 2: avança | etapa 3: cadastrar e adicionar
  //   Ctrl+Shift+Enter        → etapa 3: cadastrar e ver paciente
  //   Ctrl+← / Ctrl+→         → etapa anterior / próxima
  //   Ctrl+Backspace          → limpar o formulário atual (abre a confirmação)
  //   Ctrl+Shift+Backspace    → limpar todo o cadastro (abre a confirmação)
  //   Enter                   → dentro de um campo: submit do form (avança / cadastra e vê)
  const shortcutRef = useRef<(event: KeyboardEvent) => void>(() => {})
  function handleShortcut(event: KeyboardEvent) {
    // com modal aberto, salvando, limpando ou restaurando, o teclado é do modal/espera
    if (
      clearMode ||
      formScheduling.isHalfPaymentModalOpen ||
      isBusy ||
      isRestoring ||
      isClearingRegistration ||
      event.altKey ||
      event.metaKey
    ) {
      return
    }

    if (event.key === "Backspace" && event.ctrlKey) {
      if (event.shiftKey) {
        event.preventDefault()
        setClearMode({ kind: "all" })
      } else if (!isTextFieldWithContent(event.target)) {
        event.preventDefault()
        openCurrentCleanup()
      }
      return
    }

    if (event.key === "Enter" && event.ctrlKey) {
      // impede também o submit implícito do form
      event.preventDefault()
      if (step1.active) void handleNext("step1", imageInput.image[0]?.file)
      else if (step2.active) void handleNext("step2")
      else if (event.shiftKey) void handleRegisterAndViewPatient()
      else void handleRegisterAndAdd()
      return
    }

    // Enter sem foco em campo ou botão (ex.: depois de clicar numa área vazia)
    // também avança; dentro de um campo quem trata é o submit do form
    if (
      event.key === "Enter" &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !isFormControl(event.target) &&
      !(event.target instanceof HTMLButtonElement) &&
      !(event.target instanceof HTMLAnchorElement)
    ) {
      event.preventDefault()
      formRef.current?.requestSubmit()
      return
    }

    if (
      (event.key === "ArrowLeft" || event.key === "ArrowRight") &&
      event.ctrlKey &&
      !event.shiftKey
    ) {
      const order = ["step1", "step2", "step3"] as const
      const current = step1.active ? 0 : step2.active ? 1 : 2
      const next = current + (event.key === "ArrowRight" ? 1 : -1)
      if (next < 0 || next > 2) return
      event.preventDefault()
      // mesma regra dos círculos de etapa: só avança se a etapa atual estiver completa
      handleStepClick(order[next])
    }
  }

  // a ref sempre aponta para a versão mais recente (com o estado atual)
  useEffect(() => {
    shortcutRef.current = handleShortcut
  })

  useEffect(() => {
    const listener = (event: KeyboardEvent) => shortcutRef.current(event)
    window.addEventListener("keydown", listener)
    return () => window.removeEventListener("keydown", listener)
  }, [])

  return (
    <section className="flex justify-center">
      <section
        className="bg-white rounded-md px-2 py-2 m-3 w-full max-w-210 flex flex-col items-center"
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

        {/* atalhos só fazem sentido com teclado: escondido em celular/tablet
            (tela de toque) e em telas pequenas */}
        <details className="mt-2 hidden w-full max-w-180 px-3 font-open-sans text-xs text-[#8C7B6B] md:pointer-fine:block">
          <summary className="cursor-pointer select-none text-center hover:text-[#FFA726]">
            Atalhos de teclado
          </summary>
          <ul className="mt-2 grid gap-1 rounded-md bg-[#FFF7ED] p-3 sm:grid-cols-2">
            <li><kbd className="font-semibold">Ctrl + Enter</kbd> avança (etapa 3: cadastrar e adicionar)</li>
            <li><kbd className="font-semibold">Ctrl + Shift + Enter</kbd> etapa 3: cadastrar e ver</li>
            <li><kbd className="font-semibold">Ctrl + ← →</kbd> navega entre as etapas</li>
            <li><kbd className="font-semibold">Ctrl + Backspace</kbd> limpa o formulário atual</li>
            <li><kbd className="font-semibold">Ctrl + Shift + Backspace</kbd> limpa todo o cadastro</li>
            <li><kbd className="font-semibold">Enter</kbd> num campo também avança</li>
          </ul>
        </details>

        <form
          ref={formRef}
          noValidate
          onSubmit={(event) => {
            // Enter = botão principal da etapa: "Próximo" nas etapas 1 e 2 e
            // "Cadastrar e ver paciente" na 3 (cada um passa pelas validações)
            event.preventDefault()
            if (isBusy || isRestoring || isClearingRegistration) return
            if (step1.active) void handleNext("step1", imageInput.image[0]?.file)
            else if (step2.active) void handleNext("step2")
            // com o modal de "50% agora" aberto, o Enter pertence ao modal
            else if (step3.active && !formScheduling.isHalfPaymentModalOpen) {
              void handleRegisterAndViewPatient()
            }
          }}
          className="flex flex-col gap-6 px-2"
        >
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
                  type="submit"
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
                  type="submit"
                  onPrev={() => handlePrev("step2", "step1")}
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
                  type="submit"
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
            if (
              event.target === event.currentTarget &&
              !isClearingRegistration
            ) {
              setClearMode(null)
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            onKeyDown={(event) => {
              if (event.key === "Escape" && !isClearingRegistration) {
                event.preventDefault()
                setClearMode(null)
              }
            }}
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
                autoFocus // ação destrutiva: o foco começa no Cancelar (Tab + Enter confirma)
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
