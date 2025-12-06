<template>
  <div class="flex items-center justify-between mb-4 px-2">
    <!-- Date Dropdown with Navigation -->
    <div class="flex items-center gap-2">
      <div class="relative">
        <div @click="() => { closeAllDropdowns(); showDateDropdown = !showDateDropdown }"
          class="flex items-center text-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 text-xs text-gray-700 cursor-pointer gap-2 w-full">
          {{ dateDropdownLabel }}
          <i class="pi pi-chevron-down right-2 pt-[0.2rem] text-gray-300 w-4 h-4"></i>
        </div>
        <div v-if="showDateDropdown"
          class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-max min-w-full max-h-60 overflow-y-auto">
          <div v-for="date in availableDates" :key="date.value" @click="selectDate(date)"
            class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
            :class="{ 'bg-green-50 text-green-700': selectedDate === date.value }">
            {{ date.label }}
          </div>
        </div>
      </div>
      <!-- Previous Date Button -->
      <div
        @click="navigateDate(-1)"
        :disabled="!canNavigatePrevious"
        class="flex items-center justify-center w-8 h-8 bg-gray-50 outline outline-1 outline-gray-200 rounded-full transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Previous date"
      >
        <i class="pi pi-chevron-left text-gray-600 w-3 h-3"></i>
      </div>
      <!-- Next Date Button -->
      <div
        @click="navigateDate(1)"
        :disabled="!canNavigateNext"
        class="flex items-center justify-center w-8 h-8 bg-gray-50 outline outline-1 outline-gray-200 rounded-full transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        title="Next date"
      >
        <i class="pi pi-chevron-right text-gray-600 w-3 h-3"></i>
      </div>
      <button
        @click="jumpToToday"
        class="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 bg-gray-50 outline outline-1 outline-gray-200 rounded-full transition-colors hover:bg-gray-100 hover:text-gray-800 cursor-pointer"
        title="Jump to today"
      >
        <i class="pi pi-calendar text-gray-600 w-3 h-3"></i>
        Today
      </button>
    </div>

    <!-- Filter Dropdowns -->
    <div class="flex items-center gap-4">
      <!-- Clear Filters Button -->
      <button @click="$emit('clearFilters')"
        class="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 bg-gray-50 outline outline-1 outline-gray-200 rounded-full transition-colors hover:bg-gray-100 hover:text-gray-800"
        :class="{ 'opacity-50 cursor-not-allowed': !hasActiveFilters }" :disabled="!hasActiveFilters">
        <i class="pi pi-filter-slash w-3 h-3"></i>
        Clear Filters
      </button>

      <!-- Status Filter -->
      <div class="relative">
        <div @click="() => { closeAllDropdowns(); showStatusDropdown = !showStatusDropdown }"
          class="flex items-center text-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 text-xs text-gray-700 cursor-pointer gap-2 w-full">
          {{ statusDropdownLabel }}
          <i class="pi pi-chevron-down right-2 pt-[0.2rem] text-gray-300 w-4 h-4"></i>
        </div>
        <div v-if="showStatusDropdown"
          class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-max min-w-full">
          <div v-for="option in statusOptions" :key="option.value" @click="selectStatus(option)"
            class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
            :class="{ 'bg-green-50 text-green-700': selectedStatus === option.value }">
            {{ option.label }}
          </div>
        </div>
      </div>

      <!-- Employee Filter -->
      <div class="relative">
        <div @click="() => { closeAllDropdowns(); showEmployeeDropdown = !showEmployeeDropdown }"
          class="flex items-center text-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 text-xs text-gray-700 cursor-pointer gap-2 w-full">
          {{ employeeDropdownLabel }}
          <i class="pi pi-chevron-down right-2 pt-[0.2rem] text-gray-300 w-4 h-4"></i>
        </div>
        <div v-if="showEmployeeDropdown"
          class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-max min-w-full">
          <div v-for="employee in employeeOptions" :key="employee.value" @click="selectEmployee(employee)"
            class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
            :class="{ 'bg-green-50 text-green-700': selectedEmployee === employee.value }">
            {{ employee.label }}
          </div>
        </div>
      </div>

      <!-- Department Filter -->
      <div class="relative">
        <div @click="() => { closeAllDropdowns(); showDepartmentDropdown = !showDepartmentDropdown }"
          class="flex items-center text-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 text-xs text-gray-700 cursor-pointer gap-2 w-full">
          {{ departmentDropdownLabel }}
          <i class="pi pi-chevron-down right-2 pt-[0.2rem] text-gray-300 w-4 h-4"></i>
        </div>
        <div v-if="showDepartmentDropdown"
          class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-max min-w-full">
          <div v-for="option in departmentOptions" :key="option.value" @click="selectDepartment(option)"
            class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
            :class="{ 'bg-green-50 text-green-700': selectedDepartment === option.value }">
            {{ option.label }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  selectedDate: string
  availableDates: Array<{ value: string; label: string }>
  selectedStatus: string
  selectedEmployee: string
  selectedDepartment: string
  availableEmployees: string[]
}

interface Emits {
  (e: 'dateChange', date: string): void
  (e: 'statusChange', status: string): void
  (e: 'employeeChange', employee: string): void
  (e: 'departmentChange', department: string): void
  (e: 'clearFilters'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Dropdown state
const showDateDropdown = ref(false)
const showStatusDropdown = ref(false)
const showEmployeeDropdown = ref(false)
const showDepartmentDropdown = ref(false)

// Options
const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Available', value: 'available' },
  { label: 'Understaffed', value: 'understaffed' },
  { label: 'Closed', value: 'closed' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Completed', value: 'completed' },
]

const departmentOptions = [
  { label: 'All Departments', value: 'all' },
  { label: 'Spa', value: 'spa' },
  { label: 'Reception', value: 'reception' },
  { label: 'Restaurant', value: 'restaurant' },
  { label: 'Bar', value: 'bar' },
  { label: 'Room Services', value: 'room-services' },
]

const employeeOptions = computed(() => {
  return [
    { label: 'All Employees', value: 'all' },
    ...props.availableEmployees.map(emp => ({ label: emp, value: emp }))
  ]
})

// Dropdown labels
const dateDropdownLabel = computed(() => {
  const date = props.availableDates.find(d => d.value === props.selectedDate)
  return date ? date.label : 'Select Date'
})

// Navigation helpers
const currentDateIndex = computed(() => {
  return props.availableDates.findIndex(d => d.value === props.selectedDate)
})

const canNavigatePrevious = computed(() => {
  return currentDateIndex.value > 0
})

const canNavigateNext = computed(() => {
  return currentDateIndex.value >= 0 && currentDateIndex.value < props.availableDates.length - 1
})

function navigateDate(direction: number) {
  const currentIndex = currentDateIndex.value
  if (currentIndex === -1) return
  
  const newIndex = currentIndex + direction
  if (newIndex >= 0 && newIndex < props.availableDates.length) {
    const newDate = props.availableDates[newIndex]
    emit('dateChange', newDate.value)
  }
}

function jumpToToday() {
  const today = new Date().toISOString().split('T')[0]
  const todayDate = props.availableDates.find(d => d.value === today)
  
  if (todayDate) {
    emit('dateChange', todayDate.value)
  } else {
    // If today's date is not in available dates, find the closest date
    const todayTimestamp = new Date(today).getTime()
    let closestDate = props.availableDates[0]
    let minDiff = Math.abs(new Date(closestDate.value).getTime() - todayTimestamp)
    
    props.availableDates.forEach(date => {
      const diff = Math.abs(new Date(date.value).getTime() - todayTimestamp)
      if (diff < minDiff) {
        minDiff = diff
        closestDate = date
      }
    })
    
    emit('dateChange', closestDate.value)
  }
}

const statusDropdownLabel = computed(() => {
  const option = statusOptions.find(o => o.value === props.selectedStatus)
  return option ? option.label : 'Status'
})

const employeeDropdownLabel = computed(() => {
  const option = employeeOptions.value.find(o => o.value === props.selectedEmployee)
  return option ? option.label : 'Employee'
})

const departmentDropdownLabel = computed(() => {
  const option = departmentOptions.find(o => o.value === props.selectedDepartment)
  return option ? option.label : 'Department'
})

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return props.selectedStatus !== 'all' || 
         props.selectedEmployee !== 'all' || 
         props.selectedDepartment !== 'all'
})

// Selection handlers
function selectDate(date: { value: string; label: string }) {
  emit('dateChange', date.value)
  showDateDropdown.value = false
}

function selectStatus(option: { value: string; label: string }) {
  emit('statusChange', option.value)
  showStatusDropdown.value = false
}

function selectEmployee(option: { value: string; label: string }) {
  emit('employeeChange', option.value)
  showEmployeeDropdown.value = false
}

function selectDepartment(option: { value: string; label: string }) {
  emit('departmentChange', option.value)
  showDepartmentDropdown.value = false
}

function closeAllDropdowns() {
  showDateDropdown.value = false
  showStatusDropdown.value = false
  showEmployeeDropdown.value = false
  showDepartmentDropdown.value = false
}

// Close dropdowns when clicking outside
function onClickOutsideDropdowns(e: MouseEvent) {
  const dropdowns = document.querySelectorAll('.relative')
  let clickedInside = false
  dropdowns.forEach(dropdown => {
    if (dropdown.contains(e.target as Node)) clickedInside = true
  })
  if (!clickedInside) closeAllDropdowns()
}

onMounted(() => {
  window.addEventListener('click', onClickOutsideDropdowns)
})

onUnmounted(() => {
  window.removeEventListener('click', onClickOutsideDropdowns)
})
</script>
