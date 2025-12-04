import { onMounted, onBeforeUnmount, nextTick } from 'vue'

export const useGanttLifecycle = (
  initializeViewDate: () => void,
  navigation: any,
  recomputePositions: () => void,
  validatePositioning: () => void,
) => {
  let resizeTimeout: ReturnType<typeof setTimeout> | null = null
  const onResize = () => {
    if (resizeTimeout) clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      recomputePositions()
    }, 150)
  }

  const setupComponent = async () => {
    initializeViewDate()

    if (import.meta.env.DEV) {
      navigation.validateLayout()
    }

    await nextTick()
    await nextTick()
    recomputePositions()

    setTimeout(() => {
      recomputePositions()
      if (import.meta.env.DEV) {
        setTimeout(() => validatePositioning(), 200)
      }
    }, 100)

    window.addEventListener('resize', onResize)
  }

  const cleanupComponent = () => {
    window.removeEventListener('resize', onResize)
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
      resizeTimeout = null
    }
  }

  onMounted(setupComponent)
  onBeforeUnmount(cleanupComponent)

  return {
    setupComponent,
    cleanupComponent,
  }
}
