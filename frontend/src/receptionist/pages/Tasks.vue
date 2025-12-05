<template>
  <div class="px-6">
    <div class="mb-6">
      <h2 class="font-bold text-gray-700 mb-4">Task Management</h2>
    </div>

    <!-- Task Header -->
    <TaskHeader
      :time-slots="timeSlots"
      @navigate-times="navigateTimes"
      @jump-to-now="jumpToNow"
    />

    <!-- Task Table -->
    <TaskTable
      :time-slots="timeSlots"
      :task-categories="taskCategories"
      :expanded-categories="expandedCategories"
      :hovered-column="hoveredColumn"
      :loading="loading"
      :error="error"
      @column-hover="hoveredColumn = $event"
      @column-leave="hoveredColumn = null"
      @toggle-category="toggleCategory"
      @cell-click="handleCellClick"
      @task-click="handleTaskClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TaskHeader from '@/receptionist/components/tasks/TaskHeader.vue'
import TaskTable from '@/receptionist/components/tasks/TaskTable.vue'
import { generateTimeRange } from '@/utils/timeGantt'

// Time navigation
const startHour = ref(6) // Start at 6 AM
const hoveredColumn = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const timeSlots = computed(() => {
  return generateTimeRange(startHour.value, 120, 16) // 2-hour intervals, 16 slots
})

const navigateTimes = (direction: number) => {
  // Navigate by 4 hours (2 slots)
  startHour.value += direction * 2
  if (startHour.value < 0) startHour.value = 0
  if (startHour.value > 24) startHour.value = 24 - 16
}

const jumpToNow = () => {
  const now = new Date()
  const currentHour = now.getHours()
  startHour.value = Math.max(0, currentHour - 2) // Show current time with some context
}

// Task categories matching the image structure
const expandedCategories = ref<Record<string, boolean>>({
  'spa': true,
  'reception': true,
  'restaurant': true,
  'bar': true,
  'room-services': true,
})

const taskCategories = computed(() => [
  {
    type: 'spa',
    name: 'Spa',
    color: 'green',
    items: [
      { 
        id: 'spa-1', 
        name: 'Rest Room No: 01', 
        tasks: [
          { id: '1', title: 'Closed', startTime: '06:00', endTime: '08:59', status: 'closed' },
          { id: '2', title: 'David & Smith', startTime: '09:00', endTime: '12:59', status: 'booked' },
        ]
      },
      { 
        id: 'spa-2', 
        name: 'Rest Room No: 02', 
        tasks: [
          { id: '3', title: 'Marvin, McKiney & Loren', startTime: '06:00', endTime: '12:59', status: 'booked' },
        ]
      },
    ]
  },
  {
    type: 'reception',
    name: 'Reception',
    color: 'blue',
    items: [
      { 
        id: 'reception-1', 
        name: 'Front Desk', 
        tasks: [
          { id: '4', title: 'Marken, Smith & Jones.', startTime: '06:00', endTime: '13:59', status: 'booked' },
        ]
      },
    ]
  },
  {
    type: 'restaurant',
    name: 'Restaurant',
    color: 'purple',
    items: [
      { 
        id: 'restaurant-1', 
        name: 'Table No: 01 & 02', 
        tasks: [
          { id: '5', title: 'Brooklyn & Simons', startTime: '06:00', endTime: '12:59', status: 'booked' },
          { id: '6', title: 'Rohit & Koli', startTime: '06:00', endTime: '10:59', status: 'booked' },
        ]
      },
      { 
        id: 'restaurant-2', 
        name: 'Table No: 03 & 04', 
        tasks: [
          { id: '7', title: 'Jerome, Bell & Cutler', startTime: '13:00', endTime: '21:59', status: 'booked' },
          { id: '8', title: 'Joy, William & Kenelli', startTime: '11:00', endTime: '16:59', status: 'booked' },
        ]
      },
    ]
  },
  {
    type: 'bar',
    name: 'Bar',
    color: 'orange',
    items: [
      { 
        id: 'bar-1', 
        name: 'Drink Corner', 
        tasks: [
          { id: '9', title: 'Kevin Macel', startTime: '13:00', endTime: '16:59', status: 'booked' },
          { id: '10', title: 'Kevin Macel', startTime: '17:00', endTime: '21:59', status: 'booked' },
        ]
      },
    ]
  },
  {
    type: 'room-services',
    name: 'Room Services',
    color: 'green',
    items: [
      { 
        id: 'room-1', 
        name: 'Room No: 01, 02, 03', 
        tasks: [
          { id: '11', title: 'Dianne, Rusel & Jenifer', startTime: '16:00', endTime: '21:59', status: 'booked' },
        ]
      },
      { 
        id: 'room-2', 
        name: 'Room No: 04,05,06', 
        tasks: [
          { id: '12', title: 'Joy Borma', startTime: '06:00', endTime: '09:59', status: 'booked' },
        ]
      },
    ]
  },
])

const toggleCategory = (categoryType: string) => {
  expandedCategories.value[categoryType] = !expandedCategories.value[categoryType]
}

const handleCellClick = (data: { item?: any; time: string }) => {
  console.log('Cell clicked:', data)
  // Handle creating new task/appointment
}

const handleTaskClick = (task: any) => {
  console.log('Task clicked:', task)
  // Handle task/appointment details
}
</script>
