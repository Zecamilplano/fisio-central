"use client"

import { Plus, Trash2 } from "lucide-react"
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react"

import EvolutionSection from "./evolutionSection"

type EvolutionListSectionProps = {
  title: string
  icon: ReactNode
  values: string[]
  addLabel: string
  error?: string
  temporaryWarning?: string
  optional?: "opcional" | "obrigatorio" | "none"
  onChange: (index: number, value: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
  onClear: () => void
}

const STRING_LIST_MAX_LENGTH = 150

export default function EvolutionListSection({
  title,
  icon,
  values,
  addLabel,
  error,
  temporaryWarning,
  optional = "none",
  onChange,
  onAdd,
  onRemove,
  onClear,
}: EvolutionListSectionProps) {
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
    event: KeyboardEvent<HTMLInputElement>,
    index: number
  ) {
    if (event.key === "Enter" && event.shiftKey) {
      return
    }

    if (event.key === "Enter") {
      event.preventDefault()
      event.stopPropagation()

      handleAddItem()
      return
    }

    if (event.altKey && event.key === "ArrowUp") {
      event.preventDefault()
      event.stopPropagation()

      const previousIndex = Math.max(index - 1, 0)

      setActiveIndex(previousIndex)
      focusItem(previousIndex)
      return
    }

    if (event.altKey && event.key === "ArrowDown") {
      event.preventDefault()
      event.stopPropagation()

      const nextIndex = Math.min(index + 1, values.length - 1)

      setActiveIndex(nextIndex)
      focusItem(nextIndex)
      return
    }

    if (event.shiftKey && event.key === "Delete") {
      event.preventDefault()
      event.stopPropagation()

      handleClearList()
      return
    }

    if (event.altKey && event.key === "Delete") {
      event.preventDefault()
      event.stopPropagation()

      handleRemoveItem(index)
    }
  }

  return (
    <EvolutionSection title={title} icon={icon} optional={optional}>
      <div ref={listRef} className="space-y-2">
        {values.map((value, index) => {
          const isActive = activeIndex === index

          return (
            <div
              key={`${title}-${index}`}
              className={`
                flex gap-2 rounded-xl border p-1 transition outline-none
                ${isActive ? "border-emerald-500" : "border-slate-200"}
              `}
            >
              <input
                type="text"
                data-list-item="true"
                value={value}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => {
                  setActiveIndex((currentIndex) =>
                    currentIndex === index ? null : currentIndex
                  )
                }}
                maxLength={STRING_LIST_MAX_LENGTH}
                onChange={(event) => onChange(index, event.target.value)}
                onKeyDown={(event) => handleItemKeyDown(event, index)}
                placeholder={`Digite um item de ${title.toLowerCase()}`}
                className="min-w-0 flex-1 rounded-lg bg-white px-3 py-2 text-sm outline-none transition"
              />

              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                aria-label={`Remover item de ${title}`}
                title="Remover item"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 outline-none transition hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 size={17} />
              </button>
            </div>
          )
        })}
      </div>
      {temporaryWarning && (
        <p
          role="status"
          aria-live="polite"
          className="h-8 flex items-center pl-2 rounded-lg text-sm font-medium border border-amber-200 bg-amber-50 text-amber-800"
        >
          {temporaryWarning}
        </p>
      )}

      <div className="flex justify-between w-full ">
        <button
          type="button"
          onClick={handleAddItem}
          className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-700 outline-none transition hover:text-emerald-800"
        >
          <Plus size={16} />
          {addLabel}
        </button>
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

      <p className="mt-4 text-xs leading-5 text-slate-500">
        <strong>Atalhos:</strong> Enter adiciona • Alt + ↑/↓ navega • Alt +
        Delete remove • Shift + Delete limpa todos.
      </p>

      {error && (
        <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
      )}
    </EvolutionSection>
  )
}
