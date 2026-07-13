import { useState } from "react"
import { imageType } from "@/types"

function useImageInput() {
  const [isDragging, setIsDragging] = useState(false)
  const [image, setImage] = useState<imageType>([])

  const dragEvents = {
    onDragEnter: (e: React.DragEvent<HTMLLabelElement>) => {
      setIsDragging(true)
      e.preventDefault()
      e.stopPropagation()
    },

    onDragLeave: (e: React.DragEvent<HTMLLabelElement>) => {
      setIsDragging(false)
      e.preventDefault()
      e.stopPropagation()
    },

    onDragOver: (e: React.DragEvent<HTMLLabelElement>) => {
      setIsDragging(true)
      e.preventDefault()
      e.stopPropagation()
    },

    onDrop: (e: React.DragEvent<HTMLLabelElement>) => {
      setIsDragging(false)
      e.preventDefault()
      e.stopPropagation()

      const files = Array.from(e.dataTransfer.files)
      const image = files.map((file) => {
        const { name, size } = file

        return {
          name,
          size,
          preview: URL.createObjectURL(file),
          file: file,
        }
      })
      setImage(image)
    },
  }

  function removeImage(index?: number) {
    setImage((prev) => {
      const updated =
        typeof index === "number" ? prev.filter((_, i) => i !== index) : []

      return updated
    })
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault()
    if (!event.target.files) return

    const files = Array.from(event.target.files)
    const image = files.map((file) => ({
      name: file.name,
      preview: URL.createObjectURL(file),
      file: file,
    }))

    setImage(image)
  }

  return {
    dragEvents,
    isDragging,
    image,
    removeImage,
    handleFileChange,
  }
}

export default useImageInput
