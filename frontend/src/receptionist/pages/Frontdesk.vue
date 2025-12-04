<template>
  <div class="h-full bg-white" ref="frontdeskContainer">
    <div class="flex items-center justify-between px-6 pb-2">
      <h2 class="font-bold text-gray-700">Front Desk</h2>
      <div class="flex items-center gap-2">
        <Custombutton label="Add Reservation" :hover="true" @click="handleAddReservation" />
      </div>
    </div>
    <div class="px-6 py-2">
      <div
        class="flex items-center justify-center bg-green-50 outline outline-1 outline-gray-200 rounded h-8"
      >
        <div
          @click="navigateYear(-1)"
          class="w-8 h-8 flex items-center justify-center transition-colors outline outline-1 outline-gray-200 rounded-l cursor-pointer hover:bg-gray-100"
        >
          <i class="pi pi-chevron-left text-gray-400" style="font-size: 12px; line-height: 1"></i>
        </div>
        <div class="flex flex-1 h-full">
          <div
            v-for="(year, index) in years"
            :key="year"
            @click="selectYear(year)"
            class="flex-1 text-xs text-center transition-colors border-r border-gray-300 h-full flex items-center justify-center cursor-pointer"
            :class="{
              'bg-green-700 text-white font-medium': selectedYear === year,
              'text-gray-600 hover:bg-green-100': selectedYear !== year,
              'border-r-0': index === years.length - 1,
            }"
          >
            {{ year }}
          </div>
        </div>
        <div
          @click="navigateYear(1)"
          class="w-8 h-8 flex items-center justify-center transition-colors outline outline-1 outline-gray-200 rounded-r cursor-pointer hover:bg-gray-100"
        >
          <i class="pi pi-chevron-right text-gray-400" style="font-size: 12px; line-height: 1"></i>
        </div>
      </div>

      <div
        class="flex items-center justify-center bg-green-50 outline outline-1 outline-gray-200 rounded-b h-8"
      >
        <div
          @click="navigateMonth(-1)"
          class="w-8 h-8 flex items-center justify-center transition-colors outline outline-1 outline-gray-200 rounded-bl cursor-pointer hover:bg-gray-100"
        >
          <i class="pi pi-chevron-left text-gray-400" style="font-size: 12px; line-height: 1"></i>
        </div>
        <div class="flex flex-1 items-center h-full">
          <div
            v-for="(month, index) in months"
            :key="month"
            @click="selectMonth(index)"
            class="flex-1 text-xs text-center whitespace-nowrap transition-colors border-r border-gray-300 h-full flex items-center justify-center cursor-pointer"
            :class="{
              'bg-green-700 text-white font-medium': selectedMonth === index,
              'text-gray-600 hover:bg-green-100': selectedMonth !== index,
              'border-r-0': index === months.length - 1,
            }"
          >
            {{ month }}
          </div>
        </div>
        <div
          @click="navigateMonth(1)"
          class="w-8 h-8 flex items-center justify-center transition-colors outline outline-1 outline-gray-200 rounded-br cursor-pointer hover:bg-gray-100"
        >
          <i class="pi pi-chevron-right text-gray-400" style="font-size: 12px; line-height: 1"></i>
        </div>
      </div>
    </div>

    <div class="px-6 py-4">
      <div class="flex items-center justify-between">
        <Searchbar
          placeholder="Search by booking number or guest"
          icon="pi pi-search"
          @search="handleSearch"
          width="20rem"
        />
        <div class="flex items-center gap-4">
          <button
            @click="clearAllFilters"
            class="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 bg-gray-50 outline outline-1 outline-gray-200 rounded-full transition-colors hover:bg-gray-100 hover:text-gray-800"
            :class="{ 'opacity-50 cursor-not-allowed': !hasActiveFilters }"
            :disabled="!hasActiveFilters"
          >
            <i class="pi pi-filter-slash w-3 h-3"></i>
            Clear Filters
          </button>

          <div class="relative">
            <div
              @click="toggleReservationDropdown"
              class="flex items-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 pr-8 text-xs text-gray-700 transition-colors cursor-pointer hover:bg-gray-100"
            >
              {{ selectedReservationFilter }}
              <i class="pi pi-chevron-down absolute right-2 text-gray-300 w-4 h-4"></i>
            </div>
            <div
              v-if="showReservationDropdown"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-full"
            >
              <div
                v-for="option in reservationStatusOptions"
                :key="option"
                @click="
                  selectedReservationFilter = option;
                  showReservationDropdown = false
                "
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
                :class="{ 'bg-green-50 text-green-700': selectedReservationFilter === option }"
              >
                {{ option }}
              </div>
            </div>
          </div>

          <div class="relative">
            <div
              @click="toggleRoomTypeDropdown"
              class="flex items-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 pr-8 text-xs text-gray-700 transition-colors cursor-pointer hover:bg-gray-100"
            >
              {{ selectedRoomTypeFilter }}
              <i class="pi pi-chevron-down absolute right-2 text-gray-300 w-4 h-4"></i>
            </div>
            <div
              v-if="showRoomTypeDropdown"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-full"
            >
              <div
                v-for="option in roomTypeOptions"
                :key="option"
                @click="
                  selectedRoomTypeFilter = option;
                  showRoomTypeDropdown = false
                "
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg whitespace-nowrap"
                :class="{ 'bg-green-50 text-green-700': selectedRoomTypeFilter === option }"
              >
                {{ option }}
              </div>
            </div>
          </div>

          <div class="relative">
            <div
              @click="toggleBookingDropdown"
              class="flex items-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 pr-8 text-xs text-gray-700 transition-colors cursor-pointer hover:bg-gray-100"
            >
              {{ selectedBookingFilter }}
              <i class="pi pi-chevron-down absolute right-2 text-gray-300 w-4 h-4"></i>
            </div>
            <div
              v-if="showBookingDropdown"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-full"
            >
              <div
                v-for="option in bookingSourceOptions"
                :key="option"
                @click="
                  selectedBookingFilter = option;
                  showBookingDropdown = false
                "
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg whitespace-nowrap"
                :class="{ 'bg-green-50 text-green-700': selectedBookingFilter === option }"
              >
                {{ option }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="px-6 py-2">
      <Ganttchart
        ref="ganttchartRef"
        :selected-year="selectedYear"
        :selected-month="selectedMonth"
        :search-query="searchQuery"
        :reservation-filter="selectedReservationFilter"
        :room-type-filter="selectedRoomTypeFilter"
        :booking-filter="selectedBookingFilter"
        :rooms="rooms"
        :reservations="reservations"
        :loading="loading || !isAuthenticated"
        :error="error || (!isAuthenticated ? 'Authentication required' : null)"
:target-date="normalizedTargetDate"
        @update-date="handleDateUpdate"
        @open-reservation-modal="handleOpenReservationModal"
        @open-reservation-editor="handleOpenReservationEditor"
      />
    </div>

    <div
      v-if="showSuccessNotification"
      class="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg z-50 max-w-md"
    >
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <i class="pi pi-check-circle text-green-600 w-5 h-5"></i>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-green-800">{{ successMessage }}</p>
        </div>
        <div class="ml-auto pl-3">
          <button
            @click="showSuccessNotification = false"
            class="text-green-400 hover:text-green-600 transition-colors"
          >
            <i class="pi pi-times w-4 h-4"></i>
          </button>
        </div>
      </div>
    </div>

    <AddReservationModal
      :is-open="showAddReservationModal"
      :prefilled-data="prefilledReservationData"
      :mode="currentMode"
      @close="handleModalClose"
      @success="handleReservationSuccess"
      @backToDetails="handleBackToDetailsFromEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '../../composables/useAuth'
import Searchbar from '@/components/Searchbar.vue'
import Ganttchart from '@/receptionist/components/frontdesk/Ganttchart.vue'
import Custombutton from '@/components/Custombutton.vue'
import AddReservationModal from '@/receptionist/components/frontdesk/AddReservationModal.vue'
import { useHotelData } from '@/composables/useHotelData'
import { useFrontdeskDateNavigation } from '@/composables/useFrontdeskDateNavigation'
import { useFrontdeskFilters } from '@/composables/useFrontdeskFilters'
import { useFilterOptions } from '@/composables/useFilterOptions'
import { useSuccessNotification } from '@/composables/useSuccessNotification'
import { useClickOutside } from '@/composables/useClickOutside'
import { buildReservationSuccessMessage } from '@/utils/messages'

const { isAuthenticated, checkAuthStatus } = useAuth()
const { rooms, reservations, loading, error, refreshAll } = useHotelData()

const {
  selectedYear,
  selectedMonth,
  targetDate,
  years,
  months,
  navigateYear,
  navigateMonth,
  selectYear,
  selectMonth,
  handleDateUpdate,
} = useFrontdeskDateNavigation()

// Normalize targetDate to a Date instance for child prop validation
const normalizedTargetDate = computed<Date | null>(() => {
  const v: any = targetDate.value as any
  if (!v) return null
  if (v instanceof Date) return v
  try {
    return new Date(v)
  } catch {
    return null
  }
})

const {
  searchQuery,
  selectedReservationFilter,
  selectedRoomTypeFilter,
  selectedBookingFilter,
  showReservationDropdown,
  showRoomTypeDropdown,
  showBookingDropdown,
  hasActiveFilters,
  clearAllFilters,
  toggleReservationDropdown,
  toggleRoomTypeDropdown,
  toggleBookingDropdown,
  closeDropdowns,
} = useFrontdeskFilters()

const showAddReservationModal = ref(false)
const currentMode = ref<'new' | 'edit'>('new')
const prefilledReservationData = ref<{
  reservationId?: string
  firstName?: string
  middleName?: string
  lastName?: string
  email?: string
  phone?: string
  countryCode?: string
  address?: string
  idDocument?: string
  numGuest?: number
  checkInDate?: string
  checkOutDate?: string
  specialRequest?: string
  status?: 'confirmed' | 'pending' | 'checkedIn'
  roomNumber?: string
} | null>(null)

const { showSuccessNotification, successMessage, showWithTimeout } = useSuccessNotification()

const { roomTypeOptions, reservationStatusOptions, bookingSourceOptions } = useFilterOptions(
  rooms,
  reservations,
)

const handleSearch = (query: string) => {
  searchQuery.value = query
}

const handleAddReservation = () => {
  prefilledReservationData.value = null
  currentMode.value = 'new'
  showAddReservationModal.value = true
}

const handleOpenReservationModal = ({
  roomNumber,
  checkInDate,
  isAvailable,
}: {
  roomNumber: string
  checkInDate: string
  isAvailable: boolean
}) => {
  if (isAvailable) {
    prefilledReservationData.value = {
      roomNumber,
      checkInDate,
    }
    currentMode.value = 'new' // 🔧 Fix: Always set to 'new' mode for cell clicks
    showAddReservationModal.value = true
  }
}

const handleOpenReservationEditor = (prefilled: any) => {
  prefilledReservationData.value = prefilled
  currentMode.value = 'edit'
  showAddReservationModal.value = true
}

const handleModalClose = () => {
  showAddReservationModal.value = false
  prefilledReservationData.value = null
}

const handleReservationSuccess = async (payload: { reservation: any; roomNumber: string }) => {
  const msg = buildReservationSuccessMessage({
    reservation: payload.reservation,
    rooms: rooms.value,
    emittedRoomNumber: payload.roomNumber,
  })
  try {
    await refreshAll()
  } catch (error) {
    // refreshAll already handles error state in the store
  }
  showWithTimeout(msg, 3000)
  showAddReservationModal.value = false
}

const ganttchartRef = ref()

const handleBackToDetailsFromEdit = (reservation: any) => {
  // Close the AddReservationModal
  showAddReservationModal.value = false
  
  // Trigger the Ganttchart to reopen ReservationDetailsModal
  if (ganttchartRef.value && reservation) {
    ganttchartRef.value.handleBackToDetails(reservation)
  }
}

onMounted(async () => {
  // First verify authentication - checkAuthStatus now handles redirects gracefully
  const isValid = await checkAuthStatus()
  
  // Only fetch data if authenticated
  if (isValid && isAuthenticated.value) {
    try {
      await refreshAll()
    } catch (error) {
      console.error('Failed to fetch hotel data:', error)
    }
  }
  // No need for else block - checkAuthStatus handles redirects automatically
})

useClickOutside(
  (target: HTMLElement) => !!target.closest('.relative'),
  () => closeDropdowns(),
)
</script>
