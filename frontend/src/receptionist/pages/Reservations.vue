<template>
  <div class="px-6">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="font-bold text-gray-700"> Reservations</h2>
      <div class="flex items-center gap-2">
        <Custombutton label="Add Reservation" :hover="true" @click="handleAddReservation" />
      </div>
    </div>

    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2 w-full">
        <Searchbar placeholder="Search reservations..." icon="pi pi-search" :outline="false"
          @search="handleReservationSearch" width="20rem" />
        <div class="flex items-center gap-4 ml-auto">
          <!-- Clear Filters Button -->
          <button @click="clearAllFilters"
            class="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 bg-gray-50 outline outline-1 outline-gray-200 rounded-full transition-colors hover:bg-gray-100 hover:text-gray-800"
            :class="{ 'opacity-50 cursor-not-allowed': !hasActiveFilters }" :disabled="!hasActiveFilters">
            <i class="pi pi-filter-slash w-3 h-3"></i>
            Clear Filters
          </button>
          <!-- Check-in Dropdown Filter -->
          <div class="relative">
            <div @click="() => { closeAllDropdowns(); showCheckInDropdown = !showCheckInDropdown }"
              class="flex items-center text-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 text-xs text-gray-700 cursor-pointer gap-2 w-full">
              {{ checkInDropdownLabel }}
              <i class="pi pi-chevron-down right-2 pt-[0.2rem] text-gray-300 w-4 h-4"></i>
            </div>
            <div v-if="showCheckInDropdown"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-max min-w-full">
              <div v-for="option in checkInOptions" :key="option.label" @click="selectCheckIn(option)"
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
                :class="{ 'bg-green-50 text-green-700': filters.checkIn === option.value }">
                {{ option.label }}
              </div>
            </div>
          </div>
          <!-- Check-out Dropdown Filter -->
          <div class="relative">
            <div @click="() => { closeAllDropdowns(); showCheckOutDropdown = !showCheckOutDropdown }"
              class="flex items-center text-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 text-xs text-gray-700 cursor-pointer gap-2 w-full">
              {{ checkOutDropdownLabel }}
              <i class="pi pi-chevron-down right-2 pt-[0.2rem] text-gray-300 w-4 h-4"></i>
            </div>
            <div v-if="showCheckOutDropdown"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-max min-w-full">
              <div v-for="option in checkOutOptions" :key="option.label" @click="selectCheckOut(option)"
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
                :class="{ 'bg-green-50 text-green-700': filters.checkOut === option.value, 'opacity-50 pointer-events-none': option.disabled }">
                {{ option.label }}
              </div>
            </div>
          </div>
          <!-- Booking Dropdown Filter -->
          <div class="relative">
            <div @click="() => { closeAllDropdowns(); showBookingSortDropdown = !showBookingSortDropdown }"
              class="flex items-center text-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 text-xs text-gray-700 cursor-pointer gap-2 w-full">
              {{ bookingDropdownLabel }}
              <i class="pi pi-chevron-down right-2 pt-[0.2rem] text-gray-300 w-4 h-4"></i>
            </div>
            <div v-if="showBookingSortDropdown"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-max min-w-full">
              <div v-for="option in bookingSortOptions" :key="option.value" @click="selectBookingSort(option)"
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
                :class="{ 'bg-green-50 text-green-700': filters.bookingSort === option.value }">
                {{ option.label }}
              </div>
            </div>
          </div>
          <!-- Guest Dropdown Filter -->
          <div class="relative">
            <div @click="() => { closeAllDropdowns(); showGuestSortDropdown = !showGuestSortDropdown }"
              class="flex items-center text-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 text-xs text-gray-700 cursor-pointer gap-2 w-full">
              {{ guestDropdownLabel }}
              <i class="pi pi-chevron-down right-2 pt-[0.2rem] text-gray-300 w-4 h-4"></i>
            </div>
            <div v-if="showGuestSortDropdown"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-max min-w-full">
              <div v-for="option in guestSortOptions" :key="option.value" @click="selectGuestSort(option)"
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
                :class="{ 'bg-green-50 text-green-700': filters.guestSort === option.value }">
                {{ option.label }}
              </div>
            </div>
          </div>
          <!-- Status Dropdown Filter -->
          <div class="relative">
            <div @click="() => { closeAllDropdowns(); showStatusDropdown = !showStatusDropdown }"
              class="flex items-center text-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 text-xs text-gray-700 cursor-pointer gap-2 w-full">
              {{ statusDropdownLabel }}
              <i class="pi pi-chevron-down right-2 pt-[0.2rem] text-gray-300 w-4 h-4"></i>
            </div>
            <div v-if="showStatusDropdown"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-max min-w-full">
              <div v-for="option in statusOptions" :key="option.value" @click="selectStatus(option)"
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
                :class="{ 'bg-green-50 text-green-700': filters.status === option.value }">
                {{ option.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="overflow-x-auto rounded shadow border border-gray-200 mx-4">
    <table class="min-w-full bg-white border border-separate border-spacing-0">
      <thead class="bg-gray-100">
        <tr>
          <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Booking</th>
          <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Room</th>
          <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Guest</th>
          <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Check-in</th>
          <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Check-out</th>
          <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Orders</th>
          <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Amount</th>
          <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Balance</th>
          <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Source</th>
          <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="reservation in filteredReservations" :key="reservation.bookingNumber || reservation.id">
          <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">{{ reservation.bookingNumber
            || reservation.id }}</td>
          <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">{{ reservation.roomNumber ||
            reservation.room }}</td>
          <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">{{ reservation.guestName ||
            reservation.guest }}</td>
          <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">{{ reservation.checkIn ||
            reservation.checkInDate }}</td>
          <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">{{ reservation.checkOut ||
            reservation.checkOutDate }}</td>
          <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50"> 0 </td>
          <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">₱{{ reservation.amount }}</td>
          <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">₱{{ reservation.balance }}
          </td>
          <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">{{ reservation.source }}</td>
          <td class="py-2 px-4 text-xs outline outline-1 outline-gray-50">
            <span :class="getReservationStatusColor(reservation) + ' px-2 py-1 rounded-full border text-xs capitalize'">
              {{ reservation.status }}
            </span>
          </td>
        </tr>
        <tr v-if="!reservations || reservations.length === 0">
          <td class="py-4 px-4 text-center text-xs text-gray-400" colspan="10">No reservations found.</td>
        </tr>
      </tbody>
    </table>
  </div>
  <AddReservationModal :is-open="showAddReservationModal" :prefilled-data="prefilledReservationData" :mode="currentMode"
    @close="handleModalClose" @success="handleReservationSuccess" @backToDetails="handleBackToDetailsFromEdit" />
</template>

<script setup lang="ts">

import AddReservationModal from '@/receptionist/components/frontdesk/AddReservationModal.vue'

import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useHotelDataStore } from '@/stores/hotelData'
import Searchbar from '@/components/Searchbar.vue'
import Custombutton from '@/components/Custombutton.vue'
import { useFilterOptions } from '@/composables/useFilterOptions'

// Dropdown state and options for new dropdown filters
const showCheckInDropdown = ref(false)
const showCheckOutDropdown = ref(false)
const showBookingSortDropdown = ref(false)
const showGuestSortDropdown = ref(false)
const showStatusDropdown = ref(false)

const checkInDropdownLabel = computed(() => {
  const v = filters.value.checkIn
  if (!v) return 'Check-in'
  const option = checkInOptions.find(o => o.value === v)
  return option ? option.label : v
})
const checkOutDropdownLabel = computed(() => {
  const v = filters.value.checkOut
  if (!v) return 'Check-out'
  const option = checkOutOptions.value.find(o => o.value === v)
  return option ? option.label : v
})
const bookingDropdownLabel = computed(() => {
  const v = filters.value.bookingSort
  if (!v) return 'Booking'
  const option = bookingSortOptions.find(o => o.value === v)
  return option ? option.label : v
})
const guestDropdownLabel = computed(() => {
  const v = filters.value.guestSort
  if (!v) return 'Guest'
  const option = guestSortOptions.find(o => o.value === v)
  return option ? option.label : v
})
const statusDropdownLabel = computed(() => {
  const v = filters.value.status
  if (!v) return 'Status'
  const option = statusOptions.value.find(o => o.value === v)
  return option ? option.label : v
})

// Options for dropdowns
const today = new Date()
function formatDate(date: Date) {
  return date.toISOString().split('T')[0]
}
const checkInOptions = [
  { label: 'Today', value: formatDate(today) },
  { label: 'Next 3 days', value: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3)) },
  { label: '1 Week from now', value: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)) },
  { label: '1 Month from now', value: formatDate(new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())) },
]

const checkOutOptions = computed(() => {
  const checkIn = filters.value.checkIn ? new Date(filters.value.checkIn) : today
  return [
    { label: 'Same Day', value: formatDate(checkIn), disabled: false },
    { label: 'Next Day', value: formatDate(new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate() + 1)), disabled: false },
    { label: '3 Days after', value: formatDate(new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate() + 3)), disabled: false },
    { label: '1 Week after', value: formatDate(new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate() + 7)), disabled: false },
    { label: '1 Month after', value: formatDate(new Date(checkIn.getFullYear(), checkIn.getMonth() + 1, checkIn.getDate())), disabled: false },
  ]
})

const bookingSortOptions = [
  { label: 'Booking', value: '' },
  { label: 'Booking Asc', value: 'asc' },
  { label: 'Booking Desc', value: 'desc' },
]
const guestSortOptions = [
  { label: 'Guest', value: '' },
  { label: 'A-Z', value: 'az' },
  { label: 'Z-A', value: 'za' },
]
const statusOptions = computed(() => [
  { label: 'Status', value: '' },
  ...reservationStatusOptions.value.map(opt => ({ label: opt, value: opt }))
])

function selectCheckIn(option: DropdownOption) {
  filters.value.checkIn = option.value
  showCheckInDropdown.value = false
  // Reset check out if it is before check in
  if (filters.value.checkOut && filters.value.checkOut < option.value) filters.value.checkOut = ''
}
function selectCheckOut(option: DropdownOption) {
  if (!option.disabled) {
    filters.value.checkOut = option.value
    showCheckOutDropdown.value = false
  }
}
function selectBookingSort(option: DropdownOption) {
  filters.value.bookingSort = option.value
  showBookingSortDropdown.value = false
}
import type { DropdownOption } from '@/types/DropdownOption'

function selectGuestSort(option: DropdownOption) {
  filters.value.guestSort = option.value
  showGuestSortDropdown.value = false
}
function selectStatus(option: DropdownOption) {
  filters.value.status = option.value
  showStatusDropdown.value = false
}

const hotelDataStore = useHotelDataStore()
const { reservations, loading, error } = storeToRefs(hotelDataStore)
const { roomTypeOptions, reservationStatusOptions, bookingSourceOptions } = useFilterOptions(undefined, reservations)

const searchQuery = ref('')

const filters = ref({
  checkIn: '',
  checkOut: '',
  bookingSort: '', // 'asc' | 'desc'
  guestSort: '', // 'az' | 'za'
  status: '',
})

function handleReservationSearch(query: string) {
  searchQuery.value = query
}

function clearAllFilters() {
  filters.value = { checkIn: '', checkOut: '', bookingSort: '', guestSort: '', status: '' }
}

const hasActiveFilters = computed(() => {
  const f = filters.value
  return f.checkIn || f.checkOut || f.bookingSort || f.guestSort || f.status
})

const filteredReservations = computed(() => {
  let result = reservations.value

  // Search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r =>
      (r.bookingNumber && r.bookingNumber.toLowerCase().includes(q)) ||
      (r.id && String(r.id).toLowerCase().includes(q)) ||
      (r.roomNumber && r.roomNumber.toLowerCase().includes(q)) ||
      (r.room && r.room.toLowerCase().includes(q)) ||
      (r.guestName && r.guestName.toLowerCase().includes(q)) ||
      (r.guest && r.guest.toLowerCase().includes(q))
    )
  }

  // Check-in filter
  if (filters.value.checkIn) {
    result = result.filter(r => {
      const checkInDate = r.checkIn || r.checkInDate
      return checkInDate && checkInDate >= filters.value.checkIn
    })
  }
  // Check-out filter
  if (filters.value.checkOut) {
    result = result.filter(r => {
      const checkOutDate = r.checkOut || r.checkOutDate
      return checkOutDate && checkOutDate <= filters.value.checkOut
    })
  }
  // Status filter
  if (filters.value.status && filters.value.status !== 'All Reservations') {
    const normalize = (s: string) => (s || '').toString().trim().toLowerCase().replace(/[-_ ]/g, '')
    result = result.filter(r => normalize(r.status) === normalize(filters.value.status))
  }
  // Guest alphabetical sort
  if (filters.value.guestSort === 'az') {
    result = [...result].sort((a, b) => {
      const nameA = (a.guestName || a.guest || '').toLowerCase()
      const nameB = (b.guestName || b.guest || '').toLowerCase()
      return nameA.localeCompare(nameB)
    })
  } else if (filters.value.guestSort === 'za') {
    result = [...result].sort((a, b) => {
      const nameA = (a.guestName || a.guest || '').toLowerCase()
      const nameB = (b.guestName || b.guest || '').toLowerCase()
      return nameB.localeCompare(nameA)
    })
  }
  // Booking sort
  if (filters.value.bookingSort === 'asc') {
    result = [...result].sort((a, b) => {
      const numA = a.bookingNumber || a.id
      const numB = b.bookingNumber || b.id
      return String(numA).localeCompare(String(numB), undefined, { numeric: true })
    })
  } else if (filters.value.bookingSort === 'desc') {
    result = [...result].sort((a, b) => {
      const numA = a.bookingNumber || a.id
      const numB = b.bookingNumber || b.id
      return String(numB).localeCompare(String(numA), undefined, { numeric: true })
    })
  }
  return result
})

import { getReservationStatusColor } from '@/utils/colors'


function closeAllDropdowns() {
  showCheckInDropdown.value = false
  showCheckOutDropdown.value = false
  showBookingSortDropdown.value = false
  showGuestSortDropdown.value = false
  showStatusDropdown.value = false
}

onMounted(() => {
  window.addEventListener('click', onClickOutsideDropdowns)
})

function onClickOutsideDropdowns(e: MouseEvent) {
  const dropdowns = document.querySelectorAll('.relative')
  let clickedInside = false
  dropdowns.forEach(dropdown => {
    if (dropdown.contains(e.target as Node)) clickedInside = true
  })
  if (!clickedInside) closeAllDropdowns()
}

onMounted(async () => {
  if (!reservations.value.length) {
    await hotelDataStore.fetchReservations()
  }
})

// Modal state for Add Reservation
const showAddReservationModal = ref(false)
const currentMode = ref<'new' | 'edit'>('new')
const prefilledReservationData = ref<any>(null)

function handleAddReservation() {
  prefilledReservationData.value = null
  currentMode.value = 'new'
  showAddReservationModal.value = true
}

function handleModalClose() {
  showAddReservationModal.value = false
  prefilledReservationData.value = null
}

function handleReservationSuccess(payload: { reservation: any; roomNumber: string }) {
  // Optionally, refresh reservations or show a notification
  showAddReservationModal.value = false
}

function handleBackToDetailsFromEdit(reservation: any) {
  showAddReservationModal.value = false
  // Optionally, reopen details modal if you have one
}

function handleOrder(reservation: any) {
  // Placeholder for future ordering system
}
</script>
