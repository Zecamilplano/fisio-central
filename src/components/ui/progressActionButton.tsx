"use client"

import type { ButtonHTMLAttributes, ReactNode } from "react"
import { useEffect, useState } from "react"

type ProgressActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading: boolean
  children: ReactNode
}

export function ProgressActionButton({
  loading,
  children,
  className = "",
  ...buttonProps
}: ProgressActionButtonProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!loading) {
      setProgress(0)
      return
    }

    setProgress(4)
    const interval = window.setInterval(() => {
      setProgress((current) =>
        Math.min(92, current + Math.max(0.5, (92 - current) * 0.035))
      )
    }, 120)

    return () => window.clearInterval(interval)
  }, [loading])

  return (
    <button
      {...buttonProps}
      aria-busy={loading || undefined}
      className={`relative isolate overflow-hidden ${className}`}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 bg-white transition-[width,opacity] duration-300"
          style={{
            width: `${progress}%`,
            opacity: 0.08 + (progress / 100) * 0.34,
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  )
}
