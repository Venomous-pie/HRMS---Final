<template>
  <div
    class="relative overflow-x-hidden overflow-hidden rounded-lg outline outline-1 outline-gray-200 bg-white shadow-sm"
    ref="containerEl"
  >
    <table class="w-full table-fixed border-collapse min-w-1254px">
      <thead>
        <tr>
          <th
            class="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left outline outline-1 outline-gray-100 w-270px min-w-270px max-w-270px overflow-hidden text-ellipsis whitespace-nowrap"
          >
            <div class="text-sm font-bold text-gray-700">Department</div>
          </th>

          <th
            v-for="(slot, index) in timeSlots"
            :key="`time-${index}-${slot.time}`"
            data-task-time-cell
            class="px-1 py-2 text-center outline outline-1 outline-gray-100 transition-colors w-61.5px min-w-61.5px max-w-61.5px overflow-hidden h-48px"
            :class="{ 'bg-green-50': hoveredColumn === slot.time }"
            @mouseenter="$emit('columnHover', slot.time)"
            @mouseleave="$emit('columnLeave')"
          >
            <div class="text-xs font-bold text-gray-600">
              {{ slot.displayTime }}
            </div>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-if="loading">
          <td colspan="100%" class="text-center py-8 text-gray-500">
            Loading tasks...
          </td>
        </tr>

        <tr v-else-if="error">
          <td colspan="100%" class="text-center py-8 text-red-500">
            {{ error }}
          </td>
        </tr>

        <tr v-else-if="!taskCategories.length">
          <td colspan="100%" class="text-center py-8 text-gray-500">
            No tasks found
          </td>
        </tr>

        <template v-else v-for="category in taskCategories" :key="category.name">
          <tr class="cursor-pointer" @click="$emit('toggleCategory', category.type)">
            <td
              class="sticky left-0 z-10 px-4 py-2 bg-white border-r border-gray-200 outline outline-1 outline-gray-100 w-270px min-w-270px max-w-270px overflow-hidden text-ellipsis whitespace-nowrap h-48px"
            >
              <div class="flex items-center">
                <div class="mr-2 text-gray-500">
                  <svg
                    v-if="expandedCategories[category.type]"
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </div>
                <div class="text-sm font-medium text-gray-800">{{ category.name }}</div>
              </div>
            </td>
            <td
              v-for="(slot, slotIndex) in timeSlots"
              :key="`${category.name}-${slotIndex}-${slot.time}`"
              data-task-time-cell
              class="px-0.5 py-2 outline outline-1 outline-gray-100 transition-colors w-61.5px min-w-61.5px max-w-61.5px overflow-hidden h-48px"
              :class="{ 'bg-green-50': hoveredColumn === slot.time }"
              @mouseenter="$emit('columnHover', slot.time)"
              @mouseleave="$emit('columnLeave')"
            ></td>
          </tr>

          <template v-if="expandedCategories[category.type]">
            <tr
              v-for="item in category.items"
              :key="item.id"
              class="border-t border-gray-100"
              :ref="(el) => setRowRef(item.id, el)"
            >
              <TaskRow
                :item="item"
                :category="category"
                :time-slots="timeSlots"
                :hovered-column="hoveredColumn"
                @column-hover="$emit('columnHover', $event)"
                @column-leave="$emit('columnLeave')"
                @cell-click="$emit('cellClick', $event)"
                @item-click="() => {}"
              />
            </tr>
          </template>
        </template>
      </tbody>
    </table>

    <div class="absolute inset-0 z-30" style="pointer-events: none;">
      <template v-for="category in taskCategories" :key="category.name">
        <template v-if="expandedCategories[category.type]">
          <template v-for="item in category.items" :key="item.id">
            <template v-for="task in item.tasks" :key="task.id">
              <TaskSpan
                v-if="getTaskSpanStyle(task, item.id, category)"
                :task="task"
                :category-color="category.color"
                :style="{ ...getTaskSpanStyle(task, item.id, category), pointerEvents: 'auto' }"
                @click="$emit('taskClick', task)"
              />
            </template>
          </template>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type ComponentPublicInstance } from 'vue'
import TaskRow from './TaskRow.vue'
import TaskSpan from './TaskSpan.vue'
import { TIME_GANTT_LAYOUT, findTimeRangeIndices, calculateTaskSpanStyle } from '@/utils/timeGantt'

interface Props {
  timeSlots: Array<{
    time: string
    displayTime: string
  }>
  taskCategories: any[]
  expandedCategories: Record<string, boolean>
  hoveredColumn: string | null
  loading: boolean
  error: string | null
}

interface Emits {
  (e: 'columnHover', time: string): void
  (e: 'columnLeave'): void
  (e: 'toggleCategory', categoryType: string): void
  (e: 'cellClick', data: { item?: any; time: string }): void
  (e: 'taskClick', task: any): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const containerEl = ref<HTMLElement | null>(null)
const rowRefs = ref<Map<string, HTMLElement>>(new Map())

const setRowRef = (itemId: string, el: Element | ComponentPublicInstance | null) => {
  // Handle both Element and ComponentPublicInstance (Vue component refs)
  const domEl = el && (el as any).$el ? ((el as any).$el as Element) : (el as Element | null)
  if (domEl && domEl instanceof HTMLElement) {
    rowRefs.value.set(itemId, domEl)
  } else {
    rowRefs.value.delete(itemId)
  }
}

const getTaskSpanStyle = (task: any, itemId: string, category: any): any | null => {
  const indices = findTimeRangeIndices(props.timeSlots, task.startTime, task.endTime)
  if (!indices) return null

  const rowEl = rowRefs.value.get(itemId)
  if (!rowEl) return null

  const rect = rowEl.getBoundingClientRect()
  const containerRect = containerEl.value?.getBoundingClientRect()
  if (!containerRect) return null

  // Calculate row top position relative to container
  // The rowTop should be the top of the row, and centering will be handled in calculateTaskSpanStyle
  const rowTop = rect.top - containerRect.top

  return calculateTaskSpanStyle(indices.startIndex, indices.endIndex, rowTop)
}

defineExpose({
  containerEl,
})
</script>
