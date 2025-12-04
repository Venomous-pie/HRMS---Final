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
            <div class="text-sm font-bold text-gray-700">Rooms</div>
          </th>

          <th
            v-for="day in dateRange"
            :key="day.date"
            data-gantt-date-cell
            class="px-1 py-2 text-center outline outline-1 outline-gray-100 transition-colors w-61.5px min-w-61.5px max-w-61.5px overflow-hidden h-48px"
            :class="{ 'bg-green-50': hoveredColumn === day.date }"
            @mouseenter="$emit('columnHover', day.date)"
            @mouseleave="$emit('columnLeave')"
          >
            <div class="flex flex-col">
              <div class="text-xs font-bold text-gray-600 mb-1">
                {{ day.dayName }}
              </div>
              <div class="text-xs text-gray-500">
                {{ day.dayNumber }}
              </div>
            </div>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-if="loading">
          <td colspan="100%" class="text-center py-8 text-gray-500">
            Loading rooms and reservations...
          </td>
        </tr>

        <tr v-else-if="error">
          <td colspan="100%" class="text-center py-8 text-red-500">
            {{ error }}
          </td>
        </tr>

        <tr v-else-if="!roomCategories.length">
          <td colspan="100%" class="text-center py-8 text-gray-500">
            No rooms match the current filters
          </td>
        </tr>

        <template v-else v-for="category in roomCategories" :key="category.name">
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
                <div class="ml-2 text-xs text-gray-600">({{ category.rooms.length }})</div>
              </div>
            </td>
            <td
              v-for="day in dateRange"
              :key="`${category.name}-${day.date}`"
              data-gantt-date-cell
              class="px-0.5 py-2 outline outline-1 outline-gray-100 transition-colors text-center w-61.5px min-w-61.5px max-w-61.5px overflow-hidden h-48px"
              :class="{ 'bg-green-50': hoveredColumn === day.date }"
              @mouseenter="$emit('columnHover', day.date)"
              @mouseleave="$emit('columnLeave')"
            >
              <div class="inline-flex items-center justify-center bg-green-200 h-8 w-8 rounded">
                <span class="text-xs font-medium text-green-600">
                  {{ getAvailableRoomCountForDate(category, day.date) }}
                </span>
              </div>
            </td>
          </tr>

          <tr
            v-for="room in category.rooms"
            :key="room.number"
            v-show="expandedCategories[category.type]"
            class="border-t border-gray-100"
            :ref="(el) => setRowRef(room.number, el)"
          >
            <GanttRoomRow
              :room="room"
              :date-range="dateRange"
              :hovered-column="hoveredColumn"
              :is-room-available="isRoomAvailable"
              @column-hover="$emit('columnHover', $event)"
              @column-leave="$emit('columnLeave')"
              @cell-click="$emit('cellClick', $event)"
              @room-info-click="$emit('roomInfoClick', $event)"
            />
          </tr>
        </template>
      </tbody>
    </table>

    <div class="absolute inset-0 pointer-events-none z-30">
      <template v-for="category in roomCategories" :key="category.name">
        <template v-if="expandedCategories[category.type]">
          <template v-for="room in category.rooms" :key="room.number">
            <GanttReservationSpan
              v-for="span in getReservationSpans(room.number)"
              :key="span.key"
              :reservation="span.reservation"
              :style="span.style"
              :is-highlighted="
                highlightedReservation === (span.reservation.id || span.reservation.bookingNumber)
              "
              @click="$emit('reservationClick', $event)"
            />
          </template>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type ComponentPublicInstance } from 'vue'
import GanttRoomRow from './GanttRoomRow.vue'
import GanttReservationSpan from './GanttReservationSpan.vue'

interface Props {
  dateRange: Array<{
    date: string
    dayName: string
    dayNumber: string
  }>
  roomCategories: any[]
  expandedCategories: Record<string, boolean>
  hoveredColumn: string | null
  highlightedReservation: string | null
  loading: boolean
  error: string | null
  isRoomAvailable: (roomNumber: string, date: string) => boolean
  getAvailableRoomCountForDate: (category: any, date: string) => number
  getReservationSpans: (roomNumber: string) => any[]
  setRowRef: (roomNumber: string, el: Element | ComponentPublicInstance | null) => void
}

interface Emits {
  (e: 'columnHover', date: string): void
  (e: 'columnLeave'): void
  (e: 'toggleCategory', categoryType: string): void
  (e: 'cellClick', data: { roomNumber: string; date: string }): void
  (e: 'reservationClick', reservation: any): void
  (e: 'roomInfoClick', room: any): void
}

defineProps<Props>()
defineEmits<Emits>()

// Container element reference for positioning calculations
const containerEl = ref<HTMLElement | null>(null)

// Expose container element to parent
defineExpose({
  containerEl,
})
</script>
