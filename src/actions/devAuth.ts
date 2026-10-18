"use server"

import { createClient } from "@/lib/supabase/server"

export async function signInDevUser() {
  if (process.env.NODE_ENV !== "development") {
    return { success: false, message: "Disponível somente em desenvolvimento." }
  }

  const email = process.env.DEV_AUTH_EMAIL
  const password = process.env.DEV_AUTH_PASSWORD

  if (!email || !password) {
    return {
      success: false,
      message: "Credenciais de desenvolvimento ausentes.",
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    return { success: true }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { success: false, message: error.message }
  }

  return { success: true }
}
