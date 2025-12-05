<template>
  <div class="flex items-center justify-between mb-4 px-2">
    <div class="flex items-center text-sm text-gray-600 font-medium select-none">
      <span
        @click="$emit('navigateTimes', -1)"
        title="Previous time period"
        class="flex items-center justify-center w-8 h-8 cursor-pointer hover:bg-gray-100 rounded"
      >
        <i class="pi pi-chevron-left text-gray-600 w-3 h-3"></i>
      </span>
      <div class="text-center px-4 w-52">
        <div class="text-sm font-medium">
          {{ timeSlots[0]?.displayTime }} - {{ timeSlots[timeSlots.length - 1]?.displayTime }}
        </div>
      </div>
      <span
        @click="$emit('navigateTimes', 1)"
        title="Next time period"
        class="flex items-center justify-center w-8 h-8 cursor-pointer hover:bg-gray-100 rounded"
      >
        <i class="pi pi-chevron-right text-gray-600 w-3 h-3"></i>
      </span>

      <button
        @click="$emit('jumpToNow')"
        title="Jump to current time"
        class="ml-3 px-3 py-1 text-xs bg-gray-50 text-gray-600 border border-gray-200 rounded-full hover:bg-gray-100 hover:border-gray-300 transition-colors cursor-pointer"
      >
        Now
      </button>
    </div>

    <div class="flex items-center gap-4 text-xs">
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-full bg-green-500"></div>
        <span class="text-gray-600">Spa / Room Services</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-full bg-blue-400"></div>
        <span class="text-gray-600">Reception</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-full bg-purple-400"></div>
        <span class="text-gray-600">Restaurant</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-full bg-orange-400"></div>
        <span class="text-gray-600">Bar</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  timeSlots: Array<{
    time: string
    displayTime: string
  }>
}

interface Emits {
  (e: 'navigateTimes', direction: number): void
  (e: 'jumpToNow'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>
