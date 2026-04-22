import { useEffect, useState } from "react"
import { useGlobalPatient } from "@/context/patientContext"

function useHeaderForm() {
  const [errorImg, setErrorImg] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const { image, setImage, setHasValidPhoto } = useGlobalPatient()

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
      if (image.length >= 0) {
        setImage(image)
        setHasValidPhoto(true)
      } else {
        setHasValidPhoto(false)
      }
    },
  }

  function removeImage(index?: number) {
    setImage((prev) => {
      const updated =
        typeof index === "number" ? prev.filter((_, i) => i !== index) : []

      if (updated.length === 0) {
        setErrorImg("Adicione pelo menos uma imagem")
        setHasValidPhoto(false)
      }

      return updated
    })
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
    errorImgCallback: (msg: string) => void
  ) {
    event.preventDefault()
    if (!event.target.files) return

    const files = Array.from(event.target.files)
    const image = files.map((file) => ({
      name: file.name,
      preview: URL.createObjectURL(file),
      file: file,
    }))

    if (files.length > 0) {
      errorImgCallback("")
      setHasValidPhoto(true)
    }

    setImage(image)
  }

  useEffect(() => {
    function handleValidateImage() {
      if (image.length > 0) {
        setHasValidPhoto(true)
      } else {
        setHasValidPhoto(false)
        setErrorImg("Adicione pelo menos uma imagem")
      }
    }

    document.addEventListener("validateImage", handleValidateImage)

    return () => {
      document.removeEventListener("validateImage", handleValidateImage)
    }
  }, [image])

  return {
    dragEvents,
    isDragging,
    image,
    errorImg,
    setErrorImg,
    removeImage,
    handleFileChange,
  }
}

export default useHeaderForm
