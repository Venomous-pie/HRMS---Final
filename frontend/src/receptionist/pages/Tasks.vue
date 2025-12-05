<template>
  <div class="px-6">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="font-bold text-gray-700"> Tasks Management</h2>
      <Custombutton label="Add Task" :hover="true" @click="handleAddTask" />
    </div>

    <!-- Task Header -->
    <TaskHeader 
      :selected-date="selectedDate"
      :available-dates="availableDates"
      :selected-status="selectedStatus"
      :selected-employee="selectedEmployee"
      :selected-department="selectedDepartment"
      :available-employees="availableEmployees"
      @date-change="handleDateChange"
      @status-change="handleStatusChange"
      @employee-change="handleEmployeeChange"
      @department-change="handleDepartmentChange"
      @clear-filters="handleClearFilters"
    />

    <!-- Task Table -->
    <TaskTable :time-slots="timeSlots" :task-categories="filteredTaskCategories" :expanded-categories="expandedCategories"
      :hovered-column="hoveredColumn" :loading="loading" :error="error" @column-hover="hoveredColumn = $event"
      @column-leave="hoveredColumn = null" @toggle-category="toggleCategory" @cell-click="handleCellClick"
      @task-click="handleTaskClick" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import TaskHeader from '@/receptionist/components/tasks/TaskHeader.vue'
import TaskTable from '@/receptionist/components/tasks/TaskTable.vue'
import Custombutton from '@/components/Custombutton.vue'
import { generateTimeRange, convert12HourTo24Hour } from '@/utils/timeGantt'
import { apiFetch } from '@/services/apiClient'
import { useDateNavigationStore } from '@/stores/dateNavigation'

// Date and filters
const selectedDate = ref(new Date().toISOString().split('T')[0]) // Today's date
const availableDates = ref<Array<{ value: string; label: string }>>([])
const selectedStatus = ref('all')
const selectedEmployee = ref('all')
const selectedDepartment = ref('all')
const availableEmployees = ref<string[]>([])

// Time slots for full day (6 AM to 2 AM next day)
const timeSlots = computed(() => {
  // Generate time slots from 6 AM to 2 AM (next day) - 20 hours total
  // Using 1-hour intervals for better granularity
  return generateTimeRange(6, 60, 20) // 1-hour intervals, 20 slots
})

const hoveredColumn = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const tasks = ref<any[]>([])
const allTasks = ref<any[]>([]) // Store all tasks for filtering

// Task categories - organized by department
const expandedCategories = ref<Record<string, boolean>>({
  'spa': true,
  'reception': true,
  'restaurant': true,
  'bar': true,
  'room-services': true,
})

// Format date to "Month Day, Year" format
const formatDateLabel = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00')
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December']
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

// Filter tasks based on selected filters
const filteredTasks = computed(() => {
  let filtered = tasks.value

  // Filter by status
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(task => task.status === selectedStatus.value)
  }

  // Filter by employee
  if (selectedEmployee.value !== 'all') {
    filtered = filtered.filter(task => {
      if (!task.assignedStaff) return false
      const staffList = task.assignedStaff.split(',').map((s: string) => s.trim())
      return staffList.includes(selectedEmployee.value)
    })
  }

  // Filter by department
  if (selectedDepartment.value !== 'all') {
    filtered = filtered.filter(task => task.department === selectedDepartment.value)
  }

  return filtered
})

// Transform tasks from database into the structure needed by components
const filteredTaskCategories = computed(() => {
  if (!filteredTasks.value.length) return []

  // Group tasks by department
  const departmentMap = new Map<string, Map<string, any[]>>()

  filteredTasks.value.forEach((task) => {
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

// Use dateNavigation store to get dates like Frontdesk
const dateNavigationStore = useDateNavigationStore()

// Generate dates from available years and months (matching Frontdesk structure)
const generateDatesFromStore = () => {
  const dates: Array<{ value: string; label: string }> = []
  const years = dateNavigationStore.availableYears
  const months = dateNavigationStore.monthNames
  
  // Generate dates for all days in available years and months
  years.forEach(year => {
    months.forEach((monthName, monthIndex) => {
      // Get number of days in the month
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
      
      // Generate date for each day in the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, monthIndex, day)
        const dateStr = date.toISOString().split('T')[0]
        dates.push({
          value: dateStr,
          label: formatDateLabel(dateStr)
        })
      }
    })
  })
  
  return dates
}

// Fetch available dates from tasks and merge with store dates
const fetchAvailableDates = async () => {
  try {
    // Fetch all tasks to get available dates
    const response = await apiFetch<any[]>('/tasks')
    
    // Extract unique dates from tasks
    const taskDates = new Set<string>()
    response.forEach(task => {
      let taskDate: string
      if (task.date instanceof Date) {
        taskDate = task.date.toISOString().split('T')[0]
      } else if (typeof task.date === 'string') {
        taskDate = task.date.split('T')[0].split(' ')[0]
      } else {
        taskDate = String(task.date).split('T')[0].split(' ')[0]
      }
      taskDates.add(taskDate)
    })

    // Generate dates from store (matching Frontdesk structure)
    const storeDates = generateDatesFromStore()
    
    // Filter to only include dates that have tasks
    availableDates.value = storeDates.filter(date => taskDates.has(date.value))

    // Extract unique employees
    const employeesSet = new Set<string>()
    response.forEach(task => {
      if (task.assignedStaff) {
        task.assignedStaff.split(',').forEach((emp: string) => {
          employeesSet.add(emp.trim())
        })
      }
    })
    availableEmployees.value = Array.from(employeesSet).sort()
  } catch (err) {
    console.error('Error fetching available dates:', err)
    // Fallback to store dates if API fails
    availableDates.value = generateDatesFromStore()
  }
}

// Fetch tasks from API for selected date
const fetchTasks = async () => {
  loading.value = true
  error.value = null

  try {
    console.log(`📅 Fetching tasks for date: ${selectedDate.value}`)

    const response = await apiFetch<any[]>(
      `/tasks?date=${selectedDate.value}`
    )

    console.log(`✅ Received ${response.length} tasks from API`)

    // Filter tasks for the selected date
    const dateTasks = response.filter((task) => {
      // Normalize date to string format for comparison
      let taskDate: string
      if (task.date instanceof Date) {
        taskDate = task.date.toISOString().split('T')[0]
      } else if (typeof task.date === 'string') {
        taskDate = task.date.split('T')[0].split(' ')[0]
      } else {
        taskDate = String(task.date).split('T')[0].split(' ')[0]
      }

      return taskDate === selectedDate.value
    })

    if (dateTasks.length === 0) {
      error.value = `No tasks found for ${formatDateLabel(selectedDate.value)}. Make sure tasks have been seeded.`
    }

    tasks.value = dateTasks
    allTasks.value = dateTasks
  } catch (err) {
    console.error('Error fetching tasks:', err)
    error.value = err instanceof Error ? err.message : 'Failed to fetch tasks'
  } finally {
    loading.value = false
  }
}

// Watch for date changes and refetch
watch(() => selectedDate.value, () => {
  fetchTasks()
})

// Fetch tasks on mount
onMounted(async () => {
  await fetchAvailableDates()
  await fetchTasks()
})

// Handler functions
const handleDateChange = (date: string) => {
  selectedDate.value = date
}

const handleStatusChange = (status: string) => {
  selectedStatus.value = status
}

const handleEmployeeChange = (employee: string) => {
  selectedEmployee.value = employee
}

const handleDepartmentChange = (department: string) => {
  selectedDepartment.value = department
}

const handleClearFilters = () => {
  selectedStatus.value = 'all'
  selectedEmployee.value = 'all'
  selectedDepartment.value = 'all'
}

const toggleCategory = (categoryType: string) => {
  expandedCategories.value[categoryType] = !expandedCategories.value[categoryType]
}

const handleCellClick = (data: { item?: any; time: string }) => {
  console.log('Cell clicked:', data)
  // Handle creating new task/appointment
  // You can open a modal here to create a new task
}

const handleTaskClick = (task: any) => {
  console.log('Task clicked:', task)
  // Handle task/appointment details
  // You can open a modal here to view/edit task details
}

const handleAddTask = () => {
  console.log('Add Task button clicked')
  // TODO: Implement task creation modal
  // For now, just show an alert
  alert('Task creation feature coming soon!')
  // You can implement a modal similar to AddReservationModal here
}
</script>
