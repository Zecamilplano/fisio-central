import { useState } from "react"
import type { ChangeEvent, DragEvent } from "react"
import type { imageType } from "@/types"
import { compressPatientPhoto } from "@/utils/patient/compressPatientPhoto"

const supportedImageTypes = ["image/jpeg", "image/png", "image/webp"]

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

// prepare: como otimizar a imagem (padrão: foto de paciente, comprime acima de 5 MB)
function useImageInput(prepare: (file: File) => Promise<File> = compressPatientPhoto) {
  const [isDragging, setIsDragging] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [error, setError] = useState("")
  const [compressionMessage, setCompressionMessage] = useState("")
  const [image, setImage] = useState<imageType>([])

  async function selectImage(file?: File) {
    if (!file || isCompressing) return

    if (!supportedImageTypes.includes(file.type)) {
      setError("Escolha uma foto JPG, PNG ou WEBP.")
      return
    }

    setError("")
    setCompressionMessage("")
    setIsCompressing(true)
    try {
      const preparedPhoto = await prepare(file)
      setImage((current) => {
        current.forEach((item) => URL.revokeObjectURL(item.preview))
        return [
          {
            name: preparedPhoto.name,
            preview: URL.createObjectURL(preparedPhoto),
            file: preparedPhoto,
          },
        ]
      })
      if (preparedPhoto.size < file.size) {
        setCompressionMessage(
          `Foto otimizada: ${formatSize(file.size)} → ${formatSize(preparedPhoto.size)}.`
        )
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível preparar essa foto."
      )
    } finally {
      setIsCompressing(false)
    }
  }

  const dragEvents = {
    onDragEnter: (event: DragEvent<HTMLLabelElement>) => {
      setIsDragging(true)
      event.preventDefault()
      event.stopPropagation()
    },
    onDragLeave: (event: DragEvent<HTMLLabelElement>) => {
      setIsDragging(false)
      event.preventDefault()
      event.stopPropagation()
    },
    onDragOver: (event: DragEvent<HTMLLabelElement>) => {
      setIsDragging(true)
      event.preventDefault()
      event.stopPropagation()
    },
    onDrop: (event: DragEvent<HTMLLabelElement>) => {
      setIsDragging(false)
      event.preventDefault()
      event.stopPropagation()
      void selectImage(event.dataTransfer.files[0])
    },
  }

  function removeImage() {
    setImage((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.preview))
      return []
    })
    setError("")
    setCompressionMessage("")
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ""
    void selectImage(file)
  }

  return {
    dragEvents,
    isDragging,
    isCompressing,
    error,
    compressionMessage,
    image,
    removeImage,
    handleFileChange,
  }
}

export default useImageInput
