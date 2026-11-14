import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

type StatusPageProps = {
  icon: LucideIcon
  code?: string
  title: string
  description: string
  children?: ReactNode
}

// Cartão usado pelas páginas 404 e de erro, no mesmo visual da tela de login.
function StatusPage({
  icon: Icon,
  code,
  title,
  description,
  children,
}: StatusPageProps) {
  return (
    <section className="w-full h-full flex justify-center items-center px-4">
      <section className="bg-white w-full max-w-120 rounded-md shadow-2xl px-6 py-10 flex flex-col items-center text-center">
        <span
          aria-hidden="true"
          className="flex items-center justify-center size-16 rounded-full bg-[#FFF5EA] text-[#FFA726]"
        >
          <Icon size={32} strokeWidth={2} />
        </span>

        {code && (
          <p className="mt-6 font-montserrat text-5xl font-bold tracking-tight text-[#FFA726]">
            {code}
          </p>
        )}

        <h1 className="mt-3 font-montserrat text-2xl font-semibold text-[#2D2D2D]">
          {title}
        </h1>

        <p className="mt-3 font-open-sans text-base text-[#8C7B6B]">
          {description}
        </p>

        {children && (
          <div className="mt-8 w-full flex flex-col gap-3 font-open-sans">
            {children}
          </div>
        )}
      </section>
    </section>
  )
}

const primaryActionClassName =
  "block w-full rounded-md bg-[#FFA725] py-3 text-lg text-white cursor-pointer hover:opacity-80 active:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFA726]"

const secondaryActionClassName =
  "block w-full rounded-md bg-gray-200 py-3 text-lg text-gray-700 cursor-pointer hover:opacity-80 active:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFA726]"

export { StatusPage, primaryActionClassName, secondaryActionClassName }
