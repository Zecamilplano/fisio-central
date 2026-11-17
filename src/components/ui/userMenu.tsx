"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, LogOut } from "lucide-react"
import { toast } from "react-toastify"
import { createClient } from "@/lib/supabase/client"
import { signOutAndCleanUp } from "@/lib/auth/logout"
import { getInitialLetters } from "@/utils/patient/getInitialLetters"
import {
  getProfilePhotoUrl,
  uploadPendingProfilePhoto,
} from "@/lib/profile/profilePhoto"
import { endRegistrationDraftSession } from "@/lib/drafts/registrationDraft"

type UserInfo = {
  displayName: string // com título, ex.: "Dra. Monique Fisio"
  initials: string
  roleLabel: string | null
  photoUrl: string | null
}

// o título (Dr./Dra.) define o gênero do rótulo quando houver
function getRoleLabel(role: string | null, title: string | null) {
  const feminine = title === "Dra."
  const masculine = title === "Dr."
  switch (role) {
    case "admin":
      return feminine ? "Administradora" : masculine ? "Administrador" : "Administrador(a)"
    case "fisioterapeuta":
      return "Fisioterapeuta"
    case "recepcao":
      return "Recepção"
    case "patient":
      return "Paciente"
    default:
      return null
  }
}

async function loadUserInfo(userId: string, email: string): Promise<UserInfo> {
  const supabase = createClient()
  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name, sur_name, title, avatar_path")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("clinic_members")
      .select("role")
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle(),
  ])

  const name = [profile?.first_name, profile?.sur_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ")
  const fallbackName = name || email.split("@")[0]

  // foto escolhida no primeiro cadastro: enviada no primeiro login
  let avatarPath: string | null = profile?.avatar_path ?? null
  if (!avatarPath) {
    avatarPath = await uploadPendingProfilePhoto(userId, email).catch(() => null)
  }

  return {
    photoUrl: await getProfilePhotoUrl(avatarPath),
    displayName: [profile?.title, fallbackName].filter(Boolean).join(" "),
    initials: getInitialLetters(fallbackName) || "?",
    roleLabel: getRoleLabel(membership?.role ?? null, profile?.title ?? null),
  }
}

function Avatar({ user, className = "" }: { user: UserInfo; className?: string }) {
  if (user.photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- URL assinada temporária do Storage
      <img
        src={user.photoUrl}
        alt=""
        aria-hidden="true"
        className={`size-10 shrink-0 rounded-full object-cover bg-white ${className}`}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FFA726] font-montserrat text-sm font-bold text-white ${className}`}
    >
      {user.initials}
    </span>
  )
}

// Avatar + nome + função do usuário logado, com menu para sair.
// No celular mostra só o avatar; nome e função aparecem dentro do menu.
export function UserMenu() {
  const router = useRouter()
  const menuId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let active = true

    async function refresh(session: { user: { id: string; email?: string } } | null) {
      if (!session) {
        // sessão terminou por qualquer motivo (expirou, revogada, logout em outra aba)
        endRegistrationDraftSession()
        if (active) setUser(null)
        return
      }
      const info = await loadUserInfo(session.user.id, session.user.email ?? "")
      if (active) setUser(info)
    }

    supabase.auth.getSession().then(({ data }) => refresh(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      // evita chamar o Supabase dentro do callback (recomendação da lib)
      setTimeout(() => refresh(session), 0)
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  const closeMenu = useCallback((returnFocus = false) => {
    setIsOpen(false)
    if (returnFocus) buttonRef.current?.focus()
  }, [])

  // fecha ao clicar fora ou apertar Esc
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) closeMenu()
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenu(true)
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, closeMenu])

  async function handleLogout() {
    if (isLeaving) return
    setIsLeaving(true)
    try {
      await signOutAndCleanUp()
      setIsOpen(false)
      router.replace("/entrar")
      router.refresh()
    } catch {
      toast.error("Não foi possível sair. Tente novamente.")
    } finally {
      setIsLeaving(false)
    }
  }

  if (!user) return null

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={`Menu do usuário: ${user.displayName}`}
        className="flex items-center gap-3 rounded-full p-1 text-left text-white transition cursor-pointer hover:bg-white/10 active:scale-95 active:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFA726] md:rounded-xl md:py-1.5 md:pl-1.5 md:pr-3"
      >
        <Avatar user={user} className="ring-2 ring-white/70" />

        <span className="hidden min-w-0 flex-col md:flex">
          <span className="max-w-48 truncate font-montserrat text-sm font-semibold leading-tight">
            {user.displayName}
          </span>
          {user.roleLabel && (
            <span className="font-open-sans text-xs leading-tight text-white/75">
              {user.roleLabel}
            </span>
          )}
        </span>

        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`hidden transition-transform md:block ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
            <Avatar user={user} />
            <div className="min-w-0">
              <p className="truncate font-montserrat text-sm font-semibold text-[#2D2D2D]">
                {user.displayName}
              </p>
              {user.roleLabel && (
                <p className="font-open-sans text-xs text-[#8C7B6B]">{user.roleLabel}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={isLeaving}
            className="flex w-full items-center gap-2 px-4 py-3 font-open-sans text-sm font-medium text-red-600 transition cursor-pointer hover:bg-red-50 active:bg-red-100 focus-visible:bg-red-50 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
          >
            <LogOut size={18} aria-hidden="true" />
            {isLeaving ? "Saindo..." : "Sair"}
          </button>
        </div>
      )}
    </div>
  )
}
