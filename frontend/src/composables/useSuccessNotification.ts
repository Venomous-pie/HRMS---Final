import { ref } from 'vue'

export const useSuccessNotification = () => {
  const showSuccessNotification = ref(false)
  const successMessage = ref('')
  let timer: number | null = null

  const show = (message: string) => {
    successMessage.value = message
    showSuccessNotification.value = true
  }

  const hide = () => {
    showSuccessNotification.value = false
    successMessage.value = ''
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  const showWithTimeout = (message: string, ms = 3000) => {
    show(message)
    if (timer) clearTimeout(timer)
    timer = window.setTimeout(() => hide(), ms)
  }

  return {
    showSuccessNotification,
    successMessage,
    show,
    hide,
    showWithTimeout,
  }
}
