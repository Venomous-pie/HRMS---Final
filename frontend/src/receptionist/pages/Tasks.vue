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
import { ref, computed, onMounted, watch } from 'vue'
import TaskHeader from '@/receptionist/components/tasks/TaskHeader.vue'
import TaskTable from '@/receptionist/components/tasks/TaskTable.vue'
import { generateTimeRange } from '@/utils/timeGantt'
import { apiFetch } from '@/services/apiClient'

// Time navigation
const startHour = ref(6) // Start at 6 AM
const hoveredColumn = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const tasks = ref<any[]>([])
const selectedDate = ref(new Date().toISOString().split('T')[0]) // Today's date

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

// Task categories - organized by department
const expandedCategories = ref<Record<string, boolean>>({
  'spa': true,
  'reception': true,
  'restaurant': true,
  'bar': true,
  'room-services': true,
})

// Transform tasks from database into the structure needed by components
const taskCategories = computed(() => {
  if (!tasks.value.length) return []

  // Group tasks by department
  const departmentMap = new Map<string, Map<string, any[]>>()

  tasks.value.forEach((task) => {
    const dept = task.department
    const itemName = task.itemName

    if (!departmentMap.has(dept)) {
      departmentMap.set(dept, new Map())
    }

    const itemsMap = departmentMap.get(dept)!
    if (!itemsMap.has(itemName)) {
      itemsMap.set(itemName, [])
    }

    itemsMap.get(itemName)!.push({
      id: task.id.toString(),
      title: task.title,
      startTime: task.startTime,
      endTime: task.endTime,
      status: task.status,
      assignedStaff: task.assignedStaff,
      notes: task.notes,
    })
  })

  // Convert to array structure
  const categories: any[] = []
  
  // Define department order and colors
  const departmentConfig: Record<string, { name: string; color: string }> = {
    'spa': { name: 'Spa', color: 'green' },
    'reception': { name: 'Reception', color: 'blue' },
    'restaurant': { name: 'Restaurant', color: 'purple' },
    'bar': { name: 'Bar', color: 'orange' },
    'room-services': { name: 'Room Services', color: 'green' },
  }

  Object.entries(departmentConfig).forEach(([dept, config]) => {
    const itemsMap = departmentMap.get(dept)
    if (!itemsMap || itemsMap.size === 0) return

    const items: any[] = []
    itemsMap.forEach((taskList, itemName) => {
      items.push({
        id: `${dept}-${itemName}`,
        name: itemName,
        tasks: taskList.sort((a, b) => {
          // Sort tasks by start time
          if (a.startTime < b.startTime) return -1
          if (a.startTime > b.startTime) return 1
          return 0
        }),
      })
    })

    if (items.length > 0) {
      categories.push({
        type: dept,
        name: config.name,
        color: config.color,
        items: items.sort((a, b) => a.name.localeCompare(b.name)), // Sort items alphabetically
      })
    }
  })

  return categories
})

// Fetch tasks from API
const fetchTasks = async () => {
  loading.value = true
  error.value = null

  try {
    // Get tasks for today (the seeder creates tasks for multiple days, but we show today's schedule)
    const today = new Date().toISOString().split('T')[0]
    console.log(`📅 Fetching tasks for date: ${today}`)

    const response = await apiFetch<any[]>(
      `/tasks?date=${today}`
    )

    console.log(`✅ Received ${response.length} tasks from API`)

    // Log unique dates in response for debugging
    if (response.length > 0) {
      const uniqueDates = [...new Set(response.map(t => {
        const d = t.date instanceof Date ? t.date.toISOString().split('T')[0] : String(t.date).split('T')[0].split(' ')[0]
        return d
      }))].sort()
      console.log(`📅 Unique dates in response:`, uniqueDates.slice(0, 10))
      console.log(`📅 Looking for tasks with date: ${today}`)
    }

    // Filter tasks that fall within our visible time range and are for today
    const timeSlotsArray = timeSlots.value
    const minTime = timeSlotsArray[0]?.time || '06:00'
    const maxTime = timeSlotsArray[timeSlotsArray.length - 1]?.time || '21:59'

    const visibleTasks = response.filter((task) => {
      // Normalize date to string format for comparison
      // Handle Date objects, strings, and edge cases
      let taskDate: string
      if (task.date instanceof Date) {
        taskDate = task.date.toISOString().split('T')[0]
      } else if (typeof task.date === 'string') {
        // Handle 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:mm:ss.sssZ' formats
        taskDate = task.date.split('T')[0].split(' ')[0]
      } else {
        taskDate = String(task.date).split('T')[0].split(' ')[0]
      }
      
      // Only show tasks for today
      if (taskDate !== today) {
        // Only log first few skipped tasks to avoid console spam
        if (response.indexOf(task) < 3) {
          console.log(`⏭️ Skipping task ${task.id}: date "${taskDate}" !== today "${today}"`)
        }
        return false
      }
      
      const taskStart = task.startTime
      const taskEnd = task.endTime
      
      // Check if task overlaps with visible time range
      // Handle cases where task spans across midnight (e.g., 23:00-02:00)
      const taskStartNum = parseInt(taskStart.replace(':', ''))
      const taskEndNum = parseInt(taskEnd.replace(':', ''))
      const minTimeNum = parseInt(minTime.replace(':', ''))
      const maxTimeNum = parseInt(maxTime.replace(':', ''))
      
      // Normal case: task doesn't span midnight
      if (taskStartNum <= taskEndNum) {
        return (taskStartNum <= maxTimeNum && taskEndNum >= minTimeNum)
      }
      // Task spans midnight (e.g., 23:00-02:00)
      else {
        return (taskStartNum <= maxTimeNum || taskEndNum >= minTimeNum)
      }
    })

    console.log(`📊 Filtered to ${visibleTasks.length} visible tasks for time range ${minTime}-${maxTime}`)
    
    if (visibleTasks.length === 0 && response.length > 0) {
      console.warn(`⚠️ No tasks visible for today's time range, but ${response.length} tasks exist for date range`)
      // Show a helpful error message
      error.value = `Found ${response.length} tasks but none match today's date (${today}) or visible time range`
    } else if (visibleTasks.length === 0) {
      console.warn(`⚠️ No tasks found for date ${today}`)
      error.value = `No tasks found for today (${today}). Make sure tasks have been seeded.`
    }

    tasks.value = visibleTasks
  } catch (err) {
    console.error('Error fetching tasks:', err)
    error.value = err instanceof Error ? err.message : 'Failed to fetch tasks'
  } finally {
    loading.value = false
  }
}

// Watch for time slot changes and refetch
watch(() => timeSlots.value, () => {
  fetchTasks()
}, { deep: true })

// Fetch tasks on mount
onMounted(() => {
  fetchTasks()
})

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
