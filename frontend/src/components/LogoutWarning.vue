<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
    @click.self="$emit('cancel')"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
      <!-- Header -->
      <div class="bg-orange-500 px-6 py-4">
        <div class="flex items-center gap-3">
          <i class="pi pi-exclamation-triangle text-white text-xl"></i>
          <h3 class="text-lg font-semibold text-white">Session Expiring</h3>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6">
        <p class="text-gray-700 mb-4">
          Your session is about to expire due to inactivity or unauthorized access.
        </p>
        
        <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div class="flex items-center gap-2">
            <i class="pi pi-clock text-orange-600"></i>
            <span class="text-orange-800 font-medium">
              Auto logout in {{ countdown }} seconds
            </span>
          </div>
        </div>

        <p class="text-sm text-gray-600">
          Click "Stay Logged In" to continue your session, or you'll be automatically logged out.
        </p>
      </div>

      <!-- Actions -->
      <div class="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
        <button
          @click="$emit('logout')"
          class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          Logout Now
        </button>
        <button
          @click="$emit('cancel')"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Stay Logged In
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  countdown: number
}

interface Emits {
  (e: 'cancel'): void
  (e: 'logout'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>
