import {
  Activity,
  AlertTriangle,
  Calendar,
  ClipboardList,
  Clock,
  Dumbbell,
  HeartPulse,
  Plus,
  Save,
  Target,
  Trash2,
  User,
} from "lucide-react"
import { ReactNode, useEffect, useRef, useState } from "react"
import type { KeyboardEvent, FormEvent } from "react"
import { EvolutionFormData, EvolutionFormProps } from "./evolution.types"
import { createEmptyEvolution } from "./index"

type StringListField = "goals" | "conducts" | "orientations" | "nextConducts"

export default function EvolutionForm({
  mode = "create",
  initialData,
  onCancel,
  onSave,
}: EvolutionFormProps) {
  const [form, setForm] = useState<EvolutionFormData>(
    initialData ? structuredClone(initialData) : createEmptyEvolution()
  )

  function handleFormKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key !== "Enter") return

    if (event.shiftKey) {
      event.preventDefault()
      event.currentTarget.requestSubmit()
      return
    }

    const target = event.target as HTMLElement

    if (target.tagName === "TEXTAREA") return

    event.preventDefault()
  }
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    onSave({
      ...form,
      goals: form.goals.filter(Boolean),
      conducts: form.conducts.filter(Boolean),
      orientations: form.orientations.filter(Boolean),
      nextConducts: form.nextConducts.filter(Boolean),
      exercises: form.exercises.filter(
        (exercise) => exercise.name || exercise.details
      ),
    })
  }

  function updateStringList(
    field: "goals" | "conducts" | "orientations" | "nextConducts",
    index: number,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: current[field].map((item, itemIndex) =>
        itemIndex === index ? value : item
      ),
    }))
  }

  type StringListField = "goals" | "conducts" | "orientations" | "nextConducts"

  function addStringListItem(field: StringListField) {
    setForm((current) => {
      const list = current[field]
      const listItem = list[list.length - 1]

      if (!listItem || listItem.trim() === "") return current

      return {
        ...current,
        [field]: [...list, ""],
      }
    })
  }

  function removeStringListItem(
    field: "goals" | "conducts" | "orientations" | "nextConducts",
    index: number
  ) {
    setForm((current) => {
      const updatedList = current[field].filter(
        (_, itemIndex) => itemIndex !== index
      )

      return {
        ...current,
        [field]: updatedList.length ? updatedList : [""],
      }
    })
  }

  function clearStringList(field: StringListField) {
    setForm((current) => ({
      ...current,
      [field]: [""],
    }))
  }

  function updateExercise(
    exerciseId: string,
    field: "name" | "details",
    value: string
  ) {
    setForm((current) => ({
      ...current,
      exercises: current.exercises.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, [field]: value } : exercise
      ),
    }))
  }

  function addExercise() {
    setForm((current) => ({
      ...current,
      exercises: [
        ...current.exercises,
        {
          id: crypto.randomUUID(),
          name: "",
          details: "",
        },
      ],
    }))
  }

  function removeExercise(exerciseId: string) {
    setForm((current) => {
      const updatedExercises = current.exercises.filter(
        (exercise) => exercise.id !== exerciseId
      )

      return {
        ...current,
        exercises: updatedExercises.length
          ? updatedExercises
          : [
              {
                id: crypto.randomUUID(),
                name: "",
                details: "",
              },
            ],
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleFormKeyDown}
      className="rounded-3xl bg-white"
    >
      <div className="p-5 md:p-8">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-emerald-700 md:text-3xl">
            {mode === "create"
              ? "Adicionar evolução fisioterapêutica"
              : "Editar evolução fisioterapêutica"}
          </h1>
        </header>

        <section className="mb-5 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
              <User size={28} className="text-emerald-700" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                João da Silva
              </h2>

              <p className="text-sm text-slate-500">
                Prontuário: 000123 • 32 anos
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm sm:grid-cols-3">
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar size={17} className="text-emerald-700" />
              <span>10/07/2025</span>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <Clock size={17} className="text-emerald-700" />
              <span>16:00</span>
            </div>

            <span className="text-slate-700">sexta-feira</span>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ListSection
            title="Objetivo da sessão"
            icon={<Target size={20} />}
            values={form.goals}
            addLabel="Adicionar objetivo"
            onChange={(index, value) => updateStringList("goals", index, value)}
            onAdd={() => addStringListItem("goals")}
            onRemove={(index) => removeStringListItem("goals", index)}
            onClear={() => clearStringList("goals")}
          />

          <Section title="Intercorrências" icon={<AlertTriangle size={20} />}>
            <textarea
              value={form.complications}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  complications: event.target.value,
                }))
              }
              rows={6}
              placeholder="Descreva as intercorrências da sessão"
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </Section>

          <Section title="Exercícios realizados" icon={<Dumbbell size={20} />}>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="grid grid-cols-[1fr_1fr_44px] bg-emerald-50 text-sm font-semibold text-emerald-800">
                <div className="border-r border-slate-200 px-3 py-2">
                  Exercício
                </div>

                <div className="border-r border-slate-200 px-3 py-2">
                  Séries / Carga
                </div>

                <div />
              </div>

              {form.exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="grid grid-cols-[1fr_1fr_44px] border-t border-slate-200"
                >
                  <input
                    type="text"
                    value={exercise.name}
                    onChange={(event) =>
                      updateExercise(exercise.id, "name", event.target.value)
                    }
                    placeholder="Exercício"
                    className="border-r border-slate-200 px-3 py-2 text-sm outline-none focus:bg-emerald-50"
                  />

                  <input
                    type="text"
                    value={exercise.details}
                    onChange={(event) =>
                      updateExercise(exercise.id, "details", event.target.value)
                    }
                    placeholder="3x10, 20 kg..."
                    className="border-r border-slate-200 px-3 py-2 text-sm outline-none focus:bg-emerald-50"
                  />

                  <button
                    type="button"
                    onClick={() => removeExercise(exercise.id)}
                    aria-label="Remover exercício"
                    className="flex items-center justify-center text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addExercise}
              className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              <Plus size={16} />
              Adicionar exercício
            </button>
          </Section>

          <Section
            title="Sinais vitais"
            icon={<HeartPulse size={20} />}
            optional
          >
            <div className="space-y-3">
              <VitalField
                label="Pressão arterial"
                value={form.vitalSigns.bloodPressure}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    vitalSigns: {
                      ...current.vitalSigns,
                      bloodPressure: value,
                    },
                  }))
                }
              />

              <VitalField
                label="Frequência cardíaca"
                value={form.vitalSigns.heartRate}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    vitalSigns: {
                      ...current.vitalSigns,
                      heartRate: value,
                    },
                  }))
                }
              />

              <VitalField
                label="Frequência respiratória"
                value={form.vitalSigns.respiratoryRate}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    vitalSigns: {
                      ...current.vitalSigns,
                      respiratoryRate: value,
                    },
                  }))
                }
              />

              <VitalField
                label="Saturação"
                value={form.vitalSigns.oxygenSaturation}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    vitalSigns: {
                      ...current.vitalSigns,
                      oxygenSaturation: value,
                    },
                  }))
                }
              />
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Observações
              </span>

              <textarea
                value={form.vitalSigns.observations}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    vitalSigns: {
                      ...current.vitalSigns,
                      observations: event.target.value,
                    },
                  }))
                }
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </Section>

          <ListSection
            title="Conduta"
            icon={<ClipboardList size={20} />}
            values={form.conducts}
            addLabel="Adicionar conduta"
            onChange={(index, value) =>
              updateStringList("conducts", index, value)
            }
            onAdd={() => addStringListItem("conducts")}
            onRemove={(index) => removeStringListItem("conducts", index)}
            onClear={() => clearStringList("conducts")}
          />

          <ListSection
            title="Orientações"
            icon={<Activity size={20} />}
            values={form.orientations}
            addLabel="Adicionar orientação"
            onChange={(index, value) =>
              updateStringList("orientations", index, value)
            }
            onAdd={() => addStringListItem("orientations")}
            onRemove={(index) => removeStringListItem("orientations", index)}
            onClear={() => clearStringList("orientations")}
          />

          <section className="rounded-2xl border border-slate-200 p-5 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <Activity size={20} className="text-emerald-600" />

              <h3 className="font-semibold text-slate-800">
                Evolução / Melhora
              </h3>
            </div>

            <textarea
              value={form.progress}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  progress: event.target.value,
                }))
              }
              rows={5}
              placeholder="Descreva a evolução apresentada pelo paciente"
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm leading-6 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </section>

          <Section title="Escala de dor (EVA)" icon={<Activity size={20} />}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <PainField
                label="Antes da sessão"
                value={form.painBefore}
                variant="before"
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    painBefore: value,
                  }))
                }
              />

              <PainField
                label="Depois da sessão"
                value={form.painAfter}
                variant="after"
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    painAfter: value,
                  }))
                }
              />
            </div>
          </Section>

          <ListSection
            title="Próxima conduta"
            icon={<Activity size={20} />}
            values={form.nextConducts}
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

      <footer className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur md:flex-row md:justify-end md:px-8">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 cursor-pointer"
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          <Save size={18} />
          {mode === "create" ? "Salvar evolução" : "Salvar alterações"}
        </button>
      </footer>
    </form>
  )
}

type SectionProps = {
  title: string
  icon: ReactNode
  optional?: boolean
  children: ReactNode
}

function Section({ title, icon, optional, children }: SectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-emerald-600">
        {icon}

        <h3 className="font-semibold text-slate-800">{title}</h3>

        {optional && (
          <span className="text-xs font-normal text-slate-400">(opcional)</span>
        )}
      </div>

      {children}
    </section>
  )
}

type ListSectionProps = {
  title: string
  icon: ReactNode
  values: string[]
  addLabel: string
  onChange: (index: number, value: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
  onClear: () => void
}

function ListSection({
  title,
  icon,
  values,
  addLabel,
  onChange,
  onAdd,
  onRemove,
  onClear,
}: ListSectionProps) {
  const listRef = useRef<HTMLDivElement>(null)

  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [shouldFocusLastItem, setShouldFocusLastItem] = useState(false)

  useEffect(() => {
    if (activeIndex === null) return

    const lastValidIndex = values.length - 1

    if (activeIndex > lastValidIndex) {
      setActiveIndex(lastValidIndex >= 0 ? lastValidIndex : null)
    }
  }, [activeIndex, values.length])

  useEffect(() => {
    if (!shouldFocusLastItem) return

    const lastIndex = values.length - 1

    focusItem(lastIndex)
    setActiveIndex(lastIndex)
    setShouldFocusLastItem(false)
  }, [shouldFocusLastItem, values.length])

  function getInputs() {
    return listRef.current?.querySelectorAll<HTMLInputElement>(
      'input[data-list-item="true"]'
    )
  }

  function focusItem(index: number) {
    const inputs = getInputs()
    const input = inputs?.[index]

    if (!input) return

    input.focus()
    input.select()
  }

  function handleAddItem() {
    onAdd()
    setShouldFocusLastItem(true)
  }

  function handleRemoveItem(index: number) {
    onRemove(index)

    const nextIndex = Math.max(index - 1, 0)

    setActiveIndex(nextIndex)

    setTimeout(() => {
      focusItem(nextIndex)
    }, 0)
  }

  function handleClearList() {
    const hasContent = values.some((value) => value.trim())

    if (hasContent) {
      const confirmed = window.confirm(
        `Deseja limpar todos os itens de "${title}"?`
      )

      if (!confirmed) return
    }

    onClear()
    setActiveIndex(0)

    setTimeout(() => {
      focusItem(0)
    }, 0)
  }

  function handleItemKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) {
    // Shift + Enter salva o formulário.
    // Não bloqueamos o evento; ele sobe até o <form>.
    if (event.key === "Enter" && event.shiftKey) {
      return
    }

    // Enter cria outro item.
    if (event.key === "Enter") {
      event.preventDefault()
      event.stopPropagation()

      handleAddItem()
      return
    }

    // Alt + seta para cima.
    if (event.altKey && event.key === "ArrowUp") {
      event.preventDefault()
      event.stopPropagation()

      const previousIndex = Math.max(index - 1, 0)

      setActiveIndex(previousIndex)
      focusItem(previousIndex)
      return
    }

    // Alt + seta para baixo.
    if (event.altKey && event.key === "ArrowDown") {
      event.preventDefault()
      event.stopPropagation()

      const nextIndex = Math.min(index + 1, values.length - 1)

      setActiveIndex(nextIndex)
      focusItem(nextIndex)
      return
    }

    // Shift + Delete limpa o bloco inteiro.
    if (event.shiftKey && event.key === "Delete") {
      event.preventDefault()
      event.stopPropagation()

      handleClearList()
      return
    }

    // Delete remove o item ativo.
    if (event.key === "Delete") {
      event.preventDefault()
      event.stopPropagation()

      handleRemoveItem(index)
    }
  }

  return (
    <Section title={title} icon={icon}>
      <div className="mb-4 flex items-center justify-end">
        <button
          type="button"
          onClick={handleClearList}
          disabled={values.length === 1 && values[0].trim() === ""}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 size={15} />
          Limpar
        </button>
      </div>

      <div ref={listRef} className="space-y-2">
        {values.map((value, index) => {
          const isActive = activeIndex === index

          return (
            <div
              key={`${title}-${index}`}
              className={`
                flex gap-2 rounded-xl border p-1 transition
                ${isActive ? "border-emerald-500" : "border-slate-200"}
              `}
            >
              <input
                type="text"
                data-list-item="true"
                value={value}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => {
                  setActiveIndex((currentIndex) => {
                    return currentIndex === index ? null : currentIndex
                  })
                }}
                onClick={() => setActiveIndex(index)}
                onChange={(event) => onChange(index, event.target.value)}
                onKeyDown={(event) => handleItemKeyDown(event, index)}
                placeholder={`Digite um item de ${title.toLowerCase()}`}
                className="min-w-0 flex-1 rounded-lg bg-white px-3 py-2 text-sm outline-none transition "
              />

              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                aria-label={`Remover item de ${title}`}
                title="Remover item"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 outline-none "
              >
                <Trash2 size={17} />
              </button>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={handleAddItem}
        className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-700 transition hover:text-emerald-800 outline-none"
      >
        <Plus size={16} />
        {addLabel}
      </button>

      <p className="mt-4 text-xs leading-5 text-slate-400">
        Alt + ↑/↓ para navegar • Enter para adicionar • Delete para remover •
        Shift + Delete para limpar
      </p>
    </Section>
  )
}

type VitalFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

function VitalField({ label, value, onChange }: VitalFieldProps) {
  return (
    <label className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_180px] sm:items-center">
      <span className="text-sm text-slate-700">{label}</span>

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
    </label>
  )
}

type PainFieldProps = {
  label: string
  value: number | null
  variant: "before" | "after"
  onChange: (value: number | null) => void
}

function PainField({ label, value, variant, onChange }: PainFieldProps) {
  const isBefore = variant === "before"

  return (
    <label
      className={`rounded-xl border p-4 ${
        isBefore
          ? "border-red-100 bg-red-50"
          : "border-emerald-100 bg-emerald-50"
      }`}
    >
      <span className="mb-2 block text-center text-sm text-slate-500">
        {label}
      </span>

      <input
        type="number"
        min={0}
        max={10}
        value={value ?? ""}
        onChange={(event) => {
          const nextValue = event.target.value

          onChange(nextValue === "" ? null : Number(nextValue))
        }}
        className={`w-full bg-transparent text-center text-3xl font-bold outline-none ${
          isBefore ? "text-red-500" : "text-emerald-600"
        }`}
      />
    </label>
  )
}
