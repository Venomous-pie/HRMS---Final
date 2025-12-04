<template>
  <td
    class="sticky left-0 z-10 bg-white px-6 py-2 border-r border-gray-200 outline outline-1 outline-gray-100 w-270px min-w-270px max-w-270px overflow-hidden text-ellipsis whitespace-nowrap h-48px group"
  >
    <div class="flex items-center justify-between py-2">
      <div class="flex items-center">
        <div class="text-sm font-medium text-gray-900">{{ room.number }}</div>
        <div class="ml-2 text-xs text-gray-500">{{ room.floor }}</div>
      </div>
      
      <!-- 3-dot menu button -->
      <button
        @click="handleRoomInfoClick"
        class="hover:bg-gray-50 rounded text-gray-400 hover:text-gray-500 rounded-full"
        title="View room information"
      >
        <i class="pi pi-ellipsis-v text-sm"></i>
      </button>
    </div>
  </td>

  <td
    v-for="day in dateRange"
    :key="`${room.number}-${day.date}`"
    class="px-0.5 py-2 outline outline-1 outline-gray-100 transition-colors hover:bg-green-100 w-61.5px min-w-61.5px max-w-61.5px overflow-hidden h-48px"
    :class="{
      'bg-green-50': hoveredColumn === day.date,
      'hover:bg-blue-50 cursor-pointer': isRoomAvailable(room.number, day.date),
      'hover:bg-red-50 cursor-not-allowed': !isRoomAvailable(room.number, day.date),
    }"
    :title="getCellTooltip(room.number, day.date)"
    @mouseenter="$emit('columnHover', day.date)"
    @mouseleave="$emit('columnLeave')"
    @click="handleCellClick(room.number, day.date)"
  ></td>
</template>

<script setup lang="ts">
interface Props {
  room: {
    number: string
    floor: string
    status: string
    pricePerNight: number
    originalRoom: any
  }
  dateRange: Array<{
    date: string
    dayName: string
    dayNumber: string
  }>
  hoveredColumn: string | null
  isRoomAvailable: (roomNumber: string, date: string) => boolean
}

interface Emits {
  (e: 'columnHover', date: string): void
  (e: 'columnLeave'): void
  (e: 'cellClick', data: { roomNumber: string; date: string }): void
  (e: 'roomInfoClick', room: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const getCellTooltip = (roomNumber: string, date: string): string => {
  const available = props.isRoomAvailable(roomNumber, date)
  return available
    ? `Click to create reservation for Room ${roomNumber} on ${date}`
    : `Room ${roomNumber} is not available on ${date}`
}

const handleCellClick = (roomNumber: string, date: string): void => {
  if (props.isRoomAvailable(roomNumber, date)) {
    emit('cellClick', { roomNumber, date })
  }
}

const handleRoomInfoClick = (): void => {
  emit('roomInfoClick', props.room)
}
</script>
