import { onMounted, onBeforeUnmount } from 'vue'

export const useClickOutside = (
  isInside: (target: HTMLElement) => boolean,
  onOutside: () => void,
) => {
  const handler = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!isInside(target)) onOutside()
  }

  onMounted(() => {
    document.addEventListener('click', handler)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handler)
  })
}
