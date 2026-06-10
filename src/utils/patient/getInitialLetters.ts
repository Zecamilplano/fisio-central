const ignoredWords = ["da", "de", "do", "dos", "das"]

export function getInitialLetters(name: string) {
  return name
    .split(" ")
    .filter((word) => !ignoredWords.includes(word.toLowerCase()))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("")
}
