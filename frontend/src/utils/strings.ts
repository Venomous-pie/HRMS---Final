export function capitalizeWords(input: string): string {
  if (typeof input !== 'string') return input as unknown as string
  return input.replace(/\b\w/g, (char: string) => char.toUpperCase())
}

export function toUppercaseSafe(input: string): string {
  if (typeof input !== 'string') return input as unknown as string
  return input.toUpperCase()
}
