// Otimiza a foto de perfil só quando precisa: se a imagem já é pequena
// (lado maior <= 512 px e até 300 KB) ela vai como está; senão é reduzida
// para 512 px e convertida para WEBP (ou JPEG, se o navegador não gerar WEBP).

const AVATAR_MAX_DIMENSION = 512
const AVATAR_MAX_BYTES = 300 * 1024
const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp"]

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Não foi possível otimizar a foto."))),
      type,
      quality
    )
  })
}

export async function prepareAvatarPhoto(file: File): Promise<File> {
  if (!SUPPORTED_TYPES.includes(file.type)) {
    throw new Error("Escolha uma foto JPG, PNG ou WEBP.")
  }

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error("Não foi possível abrir essa imagem.")
  }

  try {
    const largestSide = Math.max(bitmap.width, bitmap.height)
    if (largestSide <= AVATAR_MAX_DIMENSION && file.size <= AVATAR_MAX_BYTES) {
      return file // já está otimizada
    }

    const scale = Math.min(1, AVATAR_MAX_DIMENSION / largestSide)
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))

    const context = canvas.getContext("2d")
    if (!context) throw new Error("Não foi possível otimizar a foto.")
    context.fillStyle = "#ffffff" // fundo branco para PNG com transparência
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    for (const quality of [0.85, 0.75, 0.65, 0.55]) {
      let blob = await canvasToBlob(canvas, "image/webp", quality)
      if (blob.type !== "image/webp") blob = await canvasToBlob(canvas, "image/jpeg", quality)

      if (blob.size <= AVATAR_MAX_BYTES) {
        const extension = blob.type === "image/webp" ? "webp" : "jpg"
        return new File([blob], `avatar.${extension}`, { type: blob.type })
      }
    }

    throw new Error("Não foi possível reduzir essa foto. Escolha outra imagem.")
  } finally {
    bitmap.close()
  }
}
