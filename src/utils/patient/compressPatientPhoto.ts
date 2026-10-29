const MAX_PHOTO_SIZE = 5 * 1024 * 1024
const MAX_IMAGE_DIMENSION = 2560

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error("Não foi possível comprimir a foto."))
      },
      type,
      quality
    )
  })
}

export async function compressPatientPhoto(file: File): Promise<File> {
  if (file.size <= MAX_PHOTO_SIZE) return file

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error("Não foi possível abrir essa imagem para comprimi-la.")
  }

  try {
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    if (!context) throw new Error("Não foi possível preparar a compressão da foto.")

    let scale = Math.min(
      1,
      MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height)
    )
    let quality = 0.86

    for (let attempt = 0; attempt < 18; attempt++) {
      canvas.width = Math.max(1, Math.round(bitmap.width * scale))
      canvas.height = Math.max(1, Math.round(bitmap.height * scale))
      context.fillStyle = "#ffffff"
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

      let blob = await canvasToBlob(canvas, "image/webp", quality)
      if (blob.type !== "image/webp") {
        blob = await canvasToBlob(canvas, "image/jpeg", quality)
      }

      if (blob.size <= MAX_PHOTO_SIZE) {
        const extension = blob.type === "image/webp" ? "webp" : "jpg"
        return new File(
          [blob],
          `${file.name.replace(/\.[^.]+$/, "")}.${extension}`,
          { type: blob.type, lastModified: file.lastModified }
        )
      }

      if (quality > 0.58) quality = Math.max(0.58, quality - 0.08)
      else {
        scale *= 0.82
        quality = 0.82
      }
    }

    throw new Error(
      "Não foi possível reduzir essa foto para menos de 5 MB. Escolha outra imagem."
    )
  } finally {
    bitmap.close()
  }
}
