<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-150 ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isVisible"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        :class="{ 'bg-white/80': variant === 'light' }"
        @click="handleBackdropClick"
      >
        <div
          class="flex flex-col items-center justify-center p-6 rounded-lg shadow-lg"
          :class="containerClasses"
        >
          <!-- Loading Spinner -->
          <div class="mb-4">
            <div
              v-if="spinner === 'pulse'"
              class="w-12 h-12 rounded-full animate-pulse"
              :class="spinnerClasses"
            ></div>
            <div
              v-else-if="spinner === 'dots'"
              class="flex space-x-2"
            >
              <div
                v-for="i in 3"
                :key="i"
                class="w-3 h-3 rounded-full animate-bounce"
                :class="[spinnerClasses, `animation-delay-${i * 200}ms`]"
                :style="{ animationDelay: `${i * 0.2}s` }"
              ></div>
            </div>
            <div
              v-else
              class="animate-spin rounded-full border-4 border-solid border-gray-200"
              :class="[spinnerSize, spinnerClasses]"
            ></div>
          </div>

          <!-- Loading Message -->
          <div
            v-if="message"
            class="text-center max-w-md"
          >
            <h3 class="text-lg font-medium mb-2" :class="textClasses">
              {{ message }}
            </h3>
            <p
              v-if="description"
              class="text-sm opacity-75"
              :class="textClasses"
            >
              {{ description }}
            </p>
          </div>

          <!-- Progress Bar (if progress is provided) -->
          <div
            v-if="progress !== undefined && progress >= 0"
            class="w-full max-w-xs mt-4"
          >
            <div class="flex justify-between text-xs mb-1" :class="textClasses">
              <span>Progress</span>
              <span>{{ Math.round(progress) }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300 ease-out"
                :class="progressBarClasses"
                :style="{ width: `${Math.min(100, Math.max(0, progress))}%` }"
              ></div>
            </div>
          </div>

          <!-- Cancel Button (if cancellable) -->
          <button
            v-if="cancellable"
            @click="handleCancel"
            class="mt-4 px-4 py-2 text-sm rounded-md border transition-colors"
            :class="cancelButtonClasses"
          >
            {{ cancelText }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  isVisible?: boolean
  message?: string
  description?: string
  progress?: number
  cancellable?: boolean
  cancelText?: string
  variant?: 'dark' | 'light'
  spinner?: 'spin' | 'pulse' | 'dots'
  size?: 'sm' | 'md' | 'lg'
  allowBackdropDismiss?: boolean
}

interface Emits {
  (e: 'cancel'): void
  (e: 'backdrop-click'): void
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: false,
  message: '',
  description: '',
  progress: undefined,
  cancellable: false,
  cancelText: 'Cancel',
  variant: 'dark',
  spinner: 'spin',
  size: 'md',
  allowBackdropDismiss: false
})

const emit = defineEmits<Emits>()

const containerClasses = computed(() => ({
  'bg-white text-gray-900': props.variant === 'light',
  'bg-gray-800 text-white': props.variant === 'dark'
}))

const textClasses = computed(() => ({
  'text-gray-900': props.variant === 'light',
  'text-white': props.variant === 'dark'
}))

const spinnerClasses = computed(() => {
  if (props.spinner === 'pulse' || props.spinner === 'dots') {
    return props.variant === 'light' ? 'bg-blue-600' : 'bg-blue-400'
  }
  return props.variant === 'light'
    ? 'border-t-blue-600 border-r-blue-600'
    : 'border-t-blue-400 border-r-blue-400'
})

const spinnerSize = computed(() => ({
  'w-8 h-8': props.size === 'sm',
  'w-12 h-12': props.size === 'md',
  'w-16 h-16': props.size === 'lg'
}))

const progressBarClasses = computed(() => ({
  'bg-blue-600': props.variant === 'light',
  'bg-blue-400': props.variant === 'dark'
}))

const cancelButtonClasses = computed(() => ({
  'border-gray-300 text-gray-700 hover:bg-gray-50': props.variant === 'light',
  'border-gray-600 text-gray-300 hover:bg-gray-700': props.variant === 'dark'
}))

const handleCancel = () => {
  emit('cancel')
}

const handleBackdropClick = () => {
  emit('backdrop-click')
  if (props.allowBackdropDismiss) {
    handleCancel()
  }
}
</script>

<style scoped>
/* Animation delay utility classes */
.animation-delay-200ms {
  animation-delay: 0.2s;
}

.animation-delay-400ms {
  animation-delay: 0.4s;
}

.animation-delay-600ms {
  animation-delay: 0.6s;
}
</style>