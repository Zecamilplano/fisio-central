"use client"
import { ReactNode, useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "tailwind-variants"

type ModalProp = {
  isOpen: boolean
  size?: "small" | "default" | "large"
  onClose: () => void
  hiddenClose?: boolean
  children: ReactNode
}

function Modal({
  isOpen,
  size = "default",
  onClose,
  hiddenClose,
  children,
}: ModalProp) {
  useEffect(() => {
    if (!isOpen) return

    // trava o scroll da página sempre que o modal estiver aberto
    document.body.style.overflow = "hidden"

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    // Esc só fecha modais que podem ser fechados (com o botão X visível)
    if (!hiddenClose) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose, hiddenClose])

  if (!isOpen) return

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-9999 flex items-start justify-center overflow-y-auto bg-black/60",
        size === "large" ? "p-2 md:p-4" : "p-4 md:p-8"
      )}
      onMouseDown={onClose}
    >
      <div
        className={cn(
          "relative my-auto overflow-y-auto rounded-2xl bg-white shadow-2xl",
          size === "default" && "max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-4rem)]",
          size === "small" && "w-auto md:max-h-[calc(100vh-4rem)]",
          // ocupa quase a tela toda (usado nas evoluções)
          size === "large" && "w-full max-w-7xl max-h-[calc(100vh-1rem)] md:max-h-[calc(100vh-2rem)]"
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {!hiddenClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="sticky top-4 z-10 ml-auto mr-4 mt-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-md transition cursor-pointer hover:bg-slate-100 hover:text-slate-800 hover:shadow-lg active:scale-90 active:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            <X size={20} />
          </button>
        )}
        <div className="px-4 pb-6 md:px-8 mb-8">{children}</div>
      </div>
    </div>,
    document.body
  )
}

export default Modal
