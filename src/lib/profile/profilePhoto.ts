import { createClient } from "@/lib/supabase/client"

const BUCKET = "profile-photos"
const PENDING_KEY = "pendingProfilePhoto"
const SIGNED_URL_SECONDS = 15 * 60
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

type PendingPhoto = { email: string; dataUrl: string }

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Não foi possível ler a foto."))
    reader.readAsDataURL(file)
  })
}

async function dataUrlToFile(dataUrl: string): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob()
  return new File([blob], "avatar", { type: blob.type })
}

/** Envia a foto para a pasta do usuário e grava o caminho no perfil. */
export async function uploadProfilePhoto(userId: string, photo: File): Promise<string> {
  const extension = EXTENSIONS[photo.type]
  if (!extension) throw new Error("A foto deve estar no formato JPG, PNG ou WEBP.")

  const supabase = createClient()
  const path = `${userId}/${crypto.randomUUID()}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, photo, { contentType: photo.type, upsert: false })
  if (uploadError) throw new Error("Não foi possível enviar a foto de perfil.")

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_path: path })
    .eq("id", userId)
  if (profileError) {
    await supabase.storage.from(BUCKET).remove([path]) // não deixa arquivo órfão
    throw new Error("Não foi possível salvar a foto de perfil.")
  }

  return path
}

/**
 * No primeiro cadastro ainda não há sessão (o e-mail precisa ser confirmado),
 * então a foto já otimizada fica guardada no navegador até o primeiro login.
 */
export async function savePendingProfilePhoto(email: string, photo: File) {
  try {
    const pending: PendingPhoto = {
      email: email.trim().toLowerCase(),
      dataUrl: await fileToDataUrl(photo),
    }
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending))
  } catch {
    // sem espaço/localStorage bloqueado: a foto poderá ser enviada depois
  }
}

/** Envia a foto pendente do cadastro, se for deste usuário. Devolve o caminho ou null. */
export async function uploadPendingProfilePhoto(
  userId: string,
  email: string
): Promise<string | null> {
  let pending: PendingPhoto | null = null
  try {
    pending = JSON.parse(localStorage.getItem(PENDING_KEY) ?? "null")
  } catch {
    localStorage.removeItem(PENDING_KEY)
    return null
  }
  if (!pending || pending.email !== email.trim().toLowerCase()) return null

  const path = await uploadProfilePhoto(userId, await dataUrlToFile(pending.dataUrl))
  localStorage.removeItem(PENDING_KEY)
  return path
}

/** URL temporária (15 min) para exibir a foto, ou null. */
export async function getProfilePhotoUrl(path: string | null): Promise<string | null> {
  if (!path) return null
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_SECONDS)
  return error ? null : data.signedUrl
}
