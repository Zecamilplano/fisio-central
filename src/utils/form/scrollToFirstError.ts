export function scrollToFirstError(container?: HTMLElement) {
  const root = container || document
  const firstError = root.querySelector("[data-error='true']")

  if (firstError) {
    firstError.scrollIntoView({
      behavior: "smooth",
      block: "center",
    })
    ;(firstError as HTMLElement).focus()
  }
}
