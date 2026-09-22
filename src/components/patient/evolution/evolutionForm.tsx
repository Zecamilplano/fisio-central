"use client"

import { Activity, AlertTriangle, ClipboardList, Target } from "lucide-react"

import EvolutionExerciseSection from "./components/evolutionExerciseSection"
import EvolutionFormFooter from "./components/evolutionFormFooter"
import EvolutionFormHeader from "./components/evolutionFormHeader"
import EvolutionListSection from "./components/evolutionListSection"
import EvolutionPainSection from "./components/evolutionPainSection"
import EvolutionSection from "./components/evolutionSection"
import EvolutionVitalSignsSection from "./components/evolutionVitalSignsSection"

import { useEvolutionForm } from "./hooks/useEvolutionForm"

import type { EvolutionFormProps } from "./evolution.types"
import { cn } from "tailwind-variants"

const COMPLICATIONS_MAX_LENGTH = 500
const PROGRESS_MAX_LENGTH = 2000

function EvolutionForm({
  mode = "create",
  initialData,
  onSave,
  onCancel,
  patient,
  session,
  defaultTime,
}: EvolutionFormProps) {
  const {
    form,
    errors,
    temporaryWarning,
    showWarning,

    handleSubmit,
    handleFormKeyDown,

    updateStringList,
    addStringListItem,
    removeStringListItem,
    clearStringList,

    updateExercise,
    addExercise,
    removeExercise,
    clearExercises,

    updateVitalSign,
    updateComplications,
    updateProgress,
    updatePainBefore,
    updatePainAfter,
  } = useEvolutionForm({
    initialData,
    onSave,
  })

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleFormKeyDown}
      className="rounded-3xl bg-white"
    >
      <div className="p-5 md:p-8">
        <EvolutionFormHeader
          mode={mode}
          patient={patient}
          session={session}
          defaultTime={defaultTime}
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <EvolutionListSection
            title="Objetivo da sessão"
            icon={<Target size={20} />}
            values={form.goals}
            addLabel="Adicionar objetivo"
            onChange={(index, value) => updateStringList("goals", index, value)}
            onAdd={() => addStringListItem("goals")}
            error={errors.goals}
            temporaryWarning={
              temporaryWarning?.field === "goals"
                ? temporaryWarning.message
                : undefined
            }
            onRemove={(index) => removeStringListItem("goals", index)}
            onClear={() => clearStringList("goals")}
          />

          <EvolutionSection
            title="Intercorrências"
            icon={<AlertTriangle size={20} />}
          >
            <textarea
              value={form.complications ?? ""}
              onChange={(event) => updateComplications(event.target.value)}
              rows={6}
              maxLength={COMPLICATIONS_MAX_LENGTH}
              aria-label={`Nome do exercício. Máximo de ${COMPLICATIONS_MAX_LENGTH} caracteres`}
              placeholder={
                form.complications
                  ? undefined
                  : "Descreva as intercorrências da sessão"
              }
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />

            <p
              className={cn(
                "text-xs text-right",
                (form.complications ?? "").length >= COMPLICATIONS_MAX_LENGTH
                  ? "text-red-500"
                  : (form.complications ?? "").length >=
                      COMPLICATIONS_MAX_LENGTH * 0.9
                    ? "text-yellow-600"
                    : "text-slate-500"
              )}
            >
              {(form.complications ?? "").length}/{COMPLICATIONS_MAX_LENGTH}
            </p>
          </EvolutionSection>

          <EvolutionExerciseSection
            exercises={form.exercises}
            error={errors.exercises}
            temporaryWarning={
              temporaryWarning?.field === "exercises"
                ? temporaryWarning.message
                : undefined
            }
            onChange={updateExercise}
            onAdd={addExercise}
            onRemove={removeExercise}
            onClear={clearExercises}
          />

          <EvolutionVitalSignsSection
            vitalSigns={form.vitalSigns}
            onChange={updateVitalSign}
            showWarning={showWarning}
            temporaryWarning={temporaryWarning}
          />

          <EvolutionListSection
            title="Conduta"
            icon={<ClipboardList size={20} />}
            values={form.conducts}
            error={errors.conducts}
            temporaryWarning={
              temporaryWarning?.field === "conducts"
                ? temporaryWarning?.message
                : undefined
            }
            addLabel="Adicionar conduta"
            onChange={(index, value) =>
              updateStringList("conducts", index, value)
            }
            onAdd={() => addStringListItem("conducts")}
            onRemove={(index) => removeStringListItem("conducts", index)}
            onClear={() => clearStringList("conducts")}
          />

          <EvolutionListSection
            title="Orientações"
            icon={<Activity size={20} />}
            values={form.orientations}
            error={errors.orientations}
            temporaryWarning={
              temporaryWarning?.field === "orientations"
                ? temporaryWarning?.message
                : undefined
            }
            addLabel="Adicionar orientação"
            onChange={(index, value) =>
              updateStringList("orientations", index, value)
            }
            onAdd={() => addStringListItem("orientations")}
            onRemove={(index) => removeStringListItem("orientations", index)}
            onClear={() => clearStringList("orientations")}
          />

          <EvolutionSection
            title="Evolução / Melhora"
            icon={<Activity size={20} />}
            error={errors.progress}
            className="lg:col-span-2"
          >
            <textarea
              value={form.progress}
              onChange={(event) => updateProgress(event.target.value)}
              rows={5}
              maxLength={PROGRESS_MAX_LENGTH}
              placeholder="Descreva a evolução apresentada pelo paciente"
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm leading-6 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />

            <p
              className={cn(
                "text-xs text-right",
                form.progress.length >= PROGRESS_MAX_LENGTH
                  ? "text-red-500"
                  : form.progress.length >= PROGRESS_MAX_LENGTH * 0.9
                    ? "text-yellow-600"
                    : "text-slate-500"
              )}
            >
              {form.progress.length}/{PROGRESS_MAX_LENGTH}
            </p>
            {temporaryWarning?.field === "progress" && (
              <p
                role="status"
                aria-live="polite"
                className="h-8 flex items-center pl-2 rounded-lg text-sm font-medium border border-amber-200 bg-amber-50 text-amber-800"
              >
                {temporaryWarning.field === "progress"}
              </p>
            )}
          </EvolutionSection>

          <EvolutionPainSection
            painBefore={form.painBefore}
            painAfter={form.painAfter}
            warningBefore={
              temporaryWarning?.field === "updatePainBefore"
                ? temporaryWarning.message
                : undefined
            }
            warningAfter={
              temporaryWarning?.field === "updatePainAfter"
                ? temporaryWarning.message
                : undefined
            }
            onChangeBefore={updatePainBefore}
            onChangeAfter={updatePainAfter}
          />

          <EvolutionListSection
            title="Próxima conduta"
            icon={<Activity size={20} />}
            values={form.nextConducts}
            error={errors.nextConducts}
            temporaryWarning={
              temporaryWarning?.field === "nextConducts"
                ? temporaryWarning?.message
                : undefined
            }
            addLabel="Adicionar item"
            onChange={(index, value) =>
              updateStringList("nextConducts", index, value)
            }
            onAdd={() => addStringListItem("nextConducts")}
            onRemove={(index) => removeStringListItem("nextConducts", index)}
            onClear={() => clearStringList("nextConducts")}
          />
        </div>
      </div>

      <EvolutionFormFooter mode={mode} onCancel={onCancel} />
    </form>
  )
}

export default EvolutionForm
