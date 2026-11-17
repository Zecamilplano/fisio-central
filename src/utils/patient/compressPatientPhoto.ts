// Otimiza toda foto de paciente antes do envio: a foto aparece pequena na tela,
// então não faz sentido guardar/baixar a imagem original do celular (2–5 MB).
// Se a imagem já é pequena (lado maior <= 1024 px e até 400 KB) ela vai como está;
// senão é reduzida para 1024 px e convertida para WEBP (ou JPEG, se o navegador
// não gerar WEBP), baixando a qualidade e depois o tamanho até caber no alvo.

const MAX_IMAGE_DIMENSION = 1024
const TARGET_BYTES = 400 * 1024
const MAX_PHOTO_SIZE = 5 * 1024 * 1024 // limite do bucket patient-photos
const QUALITIES = [0.82, 0.72, 0.62, 0.52]

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error("Não foi possível otimizar a foto."))
      },
      type,
      quality
    )
  })
}

export async function compressPatientPhoto(file: File): Promise<File> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error("Não foi possível abrir essa imagem para otimizá-la.")
  }

  try {
    const largestSide = Math.max(bitmap.width, bitmap.height)
    if (largestSide <= MAX_IMAGE_DIMENSION && file.size <= TARGET_BYTES) {
      return file // já está otimizada
    }

    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    if (!context) throw new Error("Não foi possível preparar a otimização da foto.")

    let scale = Math.min(1, MAX_IMAGE_DIMENSION / largestSide)
    let smallest: Blob | null = null

    // até 4 reduções de tamanho (1024 → ~420 px), cada uma testando 4 qualidades
    for (let resize = 0; resize < 5; resize++) {
      canvas.width = Math.max(1, Math.round(bitmap.width * scale))
      canvas.height = Math.max(1, Math.round(bitmap.height * scale))
      context.fillStyle = "#ffffff" // fundo branco para PNG com transparência
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

      for (const quality of QUALITIES) {
        let blob = await canvasToBlob(canvas, "image/webp", quality)
        if (blob.type !== "image/webp") {
          blob = await canvasToBlob(canvas, "image/jpeg", quality)
        }
        if (!smallest || blob.size < smallest.size) smallest = blob
        if (blob.size <= TARGET_BYTES) break
      }

      if (smallest && smallest.size <= TARGET_BYTES) break
      scale *= 0.8
    }

    // não atingiu o alvo, mas ainda serve se couber no limite do bucket
    if (!smallest || smallest.size > MAX_PHOTO_SIZE) {
      throw new Error("Não foi possível reduzir essa foto. Escolha outra imagem.")
    }

    // otimizar não pode piorar uma imagem que já era leve
    if (smallest.size >= file.size && file.size <= MAX_PHOTO_SIZE) return file

    const extension = smallest.type === "image/webp" ? "webp" : "jpg"
    return new File(
      [smallest],
      `${file.name.replace(/\.[^.]+$/, "")}.${extension}`,
      { type: smallest.type, lastModified: file.lastModified }
    )
  } finally {
    bitmap.close()
  }
}
