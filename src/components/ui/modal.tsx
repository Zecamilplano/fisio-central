"use client"
import { ReactNode, useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

type ModalProp = {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

function Modal({ isOpen, onClose, children }: ModalProp) {
  useEffect(() => {
    if (!isOpen) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    document.body.style.overflow = "hidden"

    return () => {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  if (!isOpen) return

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-start justify-center overflow-y-auto bg-black/60 p-4 md:p-8"
      onMouseDown={onClose}
    >
      <div
        className="relative my-auto max-h-[calc(100vh-2rem)] w-full max-w-7xl overflow-y-auto rounded-2xl bg-white shadow-2xl md:max-h-[calc(100vh-4rem)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="sticky top-4 z-10 ml-auto mr-4 mt-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-md transition hover:bg-slate-100 hover:text-slate-800"
        >
          <X size={20} />
        </button>
        <div className="px-4 pb-6 md:px-8 mb-8">{children}</div>
      </div>
    </div>,
    document.body
  )
}

export default Modal
