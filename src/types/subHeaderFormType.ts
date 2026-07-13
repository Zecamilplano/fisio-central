import useImageInput from "@/hook/useImageInput"

// Header form
export type SubHeaderFormRegisterType = {
  img?: ReturnType<typeof useImageInput>
  title: string
  subtitle: string
  icon: "person" | "square"
}
export type imageType = {
  name: string
  preview: string
  file?: File
}[]
// Header form
