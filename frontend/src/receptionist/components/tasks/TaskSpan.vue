<template>
  <div
    class="absolute pointer-events-auto cursor-pointer rounded-lg shadow-sm"
    :class="taskColor"
    :style="style"
    :title="tooltipText"
    @click="handleClick"
  >
    <div class="h-full flex items-center text-xs font-medium overflow-hidden">
      <div
        :class="accentColor"
        class="h-full w-3 rounded-l-lg flex-shrink-0 relative overflow-hidden"
      >
        <div
          :class="taskColor"
          class="absolute right--4 top-1/2 transform -translate-y-1/2 w-7 h-7 rounded-lg -mr-1.5"
        ></div>
      </div>
      <span class="px-3 truncate">
        {{ task.title }} {{ task.startTime }}-{{ task.endTime }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  task: {
    id: string
    title: string
    startTime: string
    endTime: string
    status: string
  }
  categoryColor: string
  style: {
    left: string
    width: string
    top: string
    height: string
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [task: any]
}>()

const taskColor = computed(() => {
  const colorMap: Record<string, string> = {
    'green': props.task.status === 'closed' 
      ? 'bg-green-100 border border-green-300' 
      : 'bg-green-200 border border-green-400',
    'blue': 'bg-blue-100 border border-blue-300',
    'purple': 'bg-purple-100 border border-purple-300',
    'orange': 'bg-orange-100 border border-orange-300',
  }
  return colorMap[props.categoryColor] || 'bg-gray-100 border border-gray-300'
})

const accentColor = computed(() => {
  const colorMap: Record<string, string> = {
    'green': props.task.status === 'closed'
      ? 'bg-green-200'
      : 'bg-green-300',
    'blue': 'bg-blue-200',
    'purple': 'bg-purple-200',
    'orange': 'bg-orange-200',
  }
  return colorMap[props.categoryColor] || 'bg-gray-200'
})

const tooltipText = computed(() => {
  return `${props.task.title} - ${props.task.startTime} to ${props.task.endTime}`
})

const handleClick = () => {
  emit('click', props.task)
}
</script>
