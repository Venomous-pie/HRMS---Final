<template>
  <td
    class="sticky left-0 z-10 bg-white px-6 py-2 border-r border-gray-200 outline outline-1 outline-gray-100 w-270px min-w-270px max-w-270px overflow-hidden text-ellipsis whitespace-nowrap h-48px group"
  >
    <div class="flex items-center justify-between py-2">
      <div class="flex items-center">
        <div 
          class="w-2 h-2 rounded-full mr-2 flex-shrink-0"
          :class="categoryDotColor"
        ></div>
        <div class="text-sm font-medium text-gray-900">{{ item.name }}</div>
      </div>
      
      <!-- 3-dot menu button -->
      <button
        @click="handleItemClick"
        class="hover:bg-gray-50 rounded text-gray-400 hover:text-gray-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        title="View item details"
      >
        <i class="pi pi-ellipsis-v text-sm"></i>
      </button>
    </div>
  </td>

  <td
    v-for="slot in timeSlots"
    :key="`${item.id}-${slot.time}`"
    class="px-0.5 py-2 outline outline-1 outline-gray-100 transition-colors hover:bg-green-100 w-61.5px min-w-61.5px max-w-61.5px overflow-hidden h-48px"
    :class="{
      'bg-green-50': hoveredColumn === slot.time,
    }"
    @mouseenter="$emit('columnHover', slot.time)"
    @mouseleave="$emit('columnLeave')"
    @click="handleCellClick(item, slot.time)"
  ></td>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  item: {
    id: string
    name: string
    tasks: any[]
  }
  category: {
    type: string
    name: string
    color: string
  }
  timeSlots: Array<{
    time: string
    displayTime: string
  }>
  hoveredColumn: string | null
}

interface Emits {
  (e: 'columnHover', time: string): void
  (e: 'columnLeave'): void
  (e: 'cellClick', data: { item: any; time: string }): void
  (e: 'itemClick', item: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const categoryDotColor = computed(() => {
  const colorMap: Record<string, string> = {
    'green': 'bg-green-500',
    'blue': 'bg-blue-400',
    'purple': 'bg-purple-400',
    'orange': 'bg-orange-400',
  }
  return colorMap[props.category.color] || 'bg-gray-400'
})

const handleCellClick = (item: any, time: string): void => {
  emit('cellClick', { item, time })
}

const handleItemClick = (): void => {
  emit('itemClick', props.item)
}
</script>
