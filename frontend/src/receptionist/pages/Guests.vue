<template>
  <div class="px-6">
    <div class="mb-6">
      <h2 class="font-bold text-gray-700 mb-4">Guest Management</h2>
      <div class="flex items-center gap-2 w-full">
        <Searchbar placeholder="Search guests..." icon="pi pi-search" :outline="true" width="20rem"
          @search="handleGuestSearch" />
        <div class="flex items-center gap-4 ml-auto">
          <button @click="clearAllFilters"
            class="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 bg-gray-50 outline outline-1 outline-gray-200 rounded-full transition-colors hover:bg-gray-100 hover:text-gray-800"
            :class="{ 'opacity-50 cursor-not-allowed': !hasActiveFilters }" :disabled="!hasActiveFilters">
            <i class="pi pi-filter-slash w-3 h-3"></i>
            Clear Filters
          </button>
        </div>
        <div class="flex items-center gap-2">
          <!-- Total Stays Dropdown -->
          <div class="relative">
            <div @click="() => { activeDropdown = activeDropdown === 'totalStays' ? null : 'totalStays' }"
              class="flex items-center text-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 text-xs text-gray-700 cursor-pointer gap-2 w-full">
              {{ totalStaysDropdownLabel }}
              <i class="pi pi-chevron-down right-2 pt-[0.2rem] text-gray-300 w-4 h-4"></i>
            </div>
            <div v-if="activeDropdown === 'totalStays'"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-max min-w-full">
              <div v-for="option in totalStaysOptions" :key="option.value" @click="selectTotalStays(option)"
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
                :class="{ 'bg-green-50 text-green-700': filters.totalStays === option.value }">
                {{ option.label }}
              </div>
            </div>
          </div>
          <!-- Total Spent Dropdown -->
          <div class="relative">
            <div @click="() => { activeDropdown = activeDropdown === 'totalSpent' ? null : 'totalSpent' }"
              class="flex items-center text-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 text-xs text-gray-700 cursor-pointer gap-2 w-full">
              {{ totalSpentDropdownLabel }}
              <i class="pi pi-chevron-down right-2 pt-[0.2rem] text-gray-300 w-4 h-4"></i>
            </div>
            <div v-if="activeDropdown === 'totalSpent'"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-max min-w-full">
              <div v-for="option in totalSpentOptions" :key="option.value" @click="selectTotalSpent(option)"
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
                :class="{ 'bg-green-50 text-green-700': filters.totalSpent === option.value }">
                {{ option.label }}
              </div>
            </div>
          </div>
          <!-- City Dropdown -->
          <div class="relative">
            <div @click="() => { activeDropdown = activeDropdown === 'city' ? null : 'city' }"
              class="flex items-center text-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 text-xs text-gray-700 cursor-pointer gap-2 w-full">
              {{ cityDropdownLabel }}
              <i class="pi pi-chevron-down right-2 pt-[0.2rem] text-gray-300 w-4 h-4"></i>
            </div>
            <div v-if="activeDropdown === 'city'"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-max min-w-full">
              <div v-for="option in cityOptions" :key="option.value" @click="selectCity(option)"
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
                :class="{ 'bg-green-50 text-green-700': filters.city === option.value }">
                {{ option.label }}
              </div>
            </div>
          </div>
          <!-- Location Type Dropdown -->
          <div class="relative">
            <div @click="() => { activeDropdown = activeDropdown === 'locationType' ? null : 'locationType' }"
              class="flex items-center text-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 text-xs text-gray-700 cursor-pointer gap-2 w-full">
              {{ locationTypeDropdownLabel }}
              <i class="pi pi-chevron-down right-2 pt-[0.2rem] text-gray-300 w-4 h-4"></i>
            </div>
            <div v-if="activeDropdown === 'locationType'"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-max min-w-full">
              <div v-for="option in locationTypeOptions" :key="option.value" @click="selectLocationType(option)"
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
                :class="{ 'bg-green-50 text-green-700': filters.locationType === option.value }">
                {{ option.label }}
              </div>
            </div>
          </div>
          <!-- Document Status Dropdown -->
          <div class="relative">
            <div @click="() => { activeDropdown = activeDropdown === 'documentStatus' ? null : 'documentStatus' }"
              class="flex items-center text-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 text-xs text-gray-700 cursor-pointer gap-2 w-full">
              {{ documentStatusDropdownLabel }}
              <i class="pi pi-chevron-down right-2 pt-[0.2rem] text-gray-300 w-4 h-4"></i>
            </div>
            <div v-if="activeDropdown === 'documentStatus'"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-max min-w-full">
              <div v-for="option in documentStatusOptions" :key="option.value" @click="selectDocumentStatus(option)"
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
                :class="{ 'bg-green-50 text-green-700': filters.documentStatus === option.value }">
                {{ option.label }}
              </div>
            </div>
          </div>
          <!-- Name Sort Dropdown -->
          <div class="relative">
            <div @click="() => { activeDropdown = activeDropdown === 'nameSort' ? null : 'nameSort' }"
              class="flex items-center text-center bg-gray-50 outline outline-1 outline-gray-200 rounded-full px-3 py-2 text-xs text-gray-700 cursor-pointer gap-2 w-full">
              {{ nameSortDropdownLabel }}
              <i class="pi pi-chevron-down right-2 pt-[0.2rem] text-gray-300 w-4 h-4"></i>
            </div>
            <div v-if="activeDropdown === 'nameSort'"
              class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-max min-w-full">
              <div v-for="option in nameSortOptions" :key="option.value" @click="selectNameSort(option)"
                class="px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
                :class="{ 'bg-green-50 text-green-700': filters.nameSort === option.value }">
                {{ option.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Results Count -->
  <div class="mb-3 mx-6 text-xs text-gray-600">
    Showing {{ filteredGuests.length }} of {{ guests.length }} guests
  </div>

  <div class="overflow-x-auto rounded shadow border border-gray-200 mx-6 mb-4">
    <table class="w-full bg-white border border-separate border-spacing-0">
      <thead class="bg-gray-100">
        <tr>
          <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Name</th>
          <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Type/Category</th>
          <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Nationality</th>
          <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Total Stays</th>
          <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Last Visited</th>
          <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Total Spent</th>
          <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Orders</th>
          <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Notes/Tags</th>
          <th class="py-2 px-4 text-xs font-semibold text-left text-gray-600">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="10" class="py-4 px-4 text-center text-xs text-gray-400">Loading guests...</td>
        </tr>
        <tr v-else-if="error">
          <td colspan="10" class="py-4 px-4 text-center text-xs text-red-500">{{ error }}</td>
        </tr>
        <tr v-else-if="filteredGuests.length === 0">
          <td colspan="10" class="py-4 px-4 text-center text-xs text-gray-400">
            {{ guests.length === 0 ? 'No guests found.' : 'No guests match the selected filters.' }}
          </td>
        </tr>
        <tr v-for="guest in paginatedGuests" :key="guest.id">
          <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">
            {{ guest.firstName }}<span v-if="guest.middleName"> {{ guest.middleName }}</span> {{ guest.lastName }}
          </td>
          <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">
            <span :class="getGuestTypeBadgeClass(guest)" class="px-2 py-1 rounded-full text-xs font-medium">
              {{ getGuestCategory(guest) }}
            </span>
          </td>
          <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">
            {{ guest.nationality || 'N/A' }}
          </td>
          <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">
            {{ guest.totalStays ?? 'N/A' }}
          </td>
          <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">
            {{ guest.lastVisited ? new Date(guest.lastVisited).toLocaleDateString() : 'N/A' }}
          </td>
          <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">
            ₱{{ guest.totalSpent ? guest.totalSpent.toLocaleString() : '0' }}
          </td>
          <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">
            {{ guest.orderCount ?? 'N/A' }}
          </td>
          <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">
            {{ guest.notes || '—' }}
          </td>
          <td class="py-2 px-4 text-xs text-gray-700 outline outline-1 outline-gray-50">
            <div class="flex gap-1">
              <button class="text-blue-600 hover:underline" @click="viewProfile(guest)">Profile</button>
              <button class="text-green-600 hover:underline" @click="editGuest(guest)">Edit</button>
              <button class="text-indigo-600 hover:underline" @click="viewReservations(guest)">Reservations</button>
              <button class="text-gray-600 hover:underline" @click="sendMessage(guest)">Message</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="flex justify-end items-center gap-2 p-4">
      <button class="px-3 py-2 rounded-full text-xs bg-gray-100 hover:bg-gray-200" :disabled="currentPage === 1"
        @click="currentPage > 1 && (currentPage -= 1)">
        Previous
      </button>
      <span class="text-xs">Page {{ currentPage }} of {{ Math.ceil(filteredGuests.length / PAGE_SIZE) }}</span>
      <button class="px-3 py-2 rounded-full text-xs bg-gray-100 hover:bg-gray-200"
        :disabled="currentPage >= Math.ceil(filteredGuests.length / PAGE_SIZE)"
        @click="currentPage < Math.ceil(filteredGuests.length / PAGE_SIZE) && (currentPage += 1)">
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import Searchbar from '@/components/Searchbar.vue'
import { useGuestStore } from '@/stores/guest'
import { useHotelDataStore } from '@/stores/hotelData'
import type { Guest, Reservation } from '@/types/hotel'

// UI State
const showAdvancedFilters = ref(false)
const activeDropdown = ref<string | null>(null)

function closeAllDropdowns() {
  activeDropdown.value = null
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

// Dropdown options
const guestStatusOptions = [
  { label: 'All Guests', value: '' },
  { label: 'Currently In-House', value: 'inhouse' },
  { label: 'Arriving Today', value: 'arrivingToday' },
  { label: 'Arriving This Week', value: 'arrivingWeek' },
  { label: 'Past Guests', value: 'past' },
  { label: 'Never Checked In', value: 'neverCheckedIn' },
  { label: 'Frequent Guests (3+ stays)', value: 'frequent' },
  { label: 'Inactive (No Recent Activity)', value: 'inactive' }
]

const guestTypeOptions = [
  { label: 'All Types', value: '' },
  { label: 'VIP', value: 'vip' },
  { label: 'Corporate', value: 'corporate' },
  { label: 'Regular', value: 'regular' },
  { label: 'Group', value: 'group' },
  { label: 'Blacklisted', value: 'blacklisted' }
]

const totalStaysOptions = [
  { label: '1 stay', value: '1' },
  { label: '2-5 stays', value: '2-5' },
  { label: '5-10 stays', value: '5-10' },
  { label: '10+ stays', value: '10+' }
]

const totalSpentOptions = [
  { label: '₱0-10k', value: '0-10000' },
  { label: '₱10k-50k', value: '10000-50000' },
  { label: '₱50k-100k', value: '50000-100000' },
  { label: '₱100k+', value: '100000+' }
]

const cityOptions = [
  { label: 'Manila', value: 'Manila' },
  { label: 'Cebu', value: 'Cebu' },
  { label: 'Davao', value: 'Davao' },
  { label: 'Quezon City', value: 'Quezon City' },
  { label: 'Makati', value: 'Makati' },
  { label: 'Pasig', value: 'Pasig' },
  { label: 'Taguig', value: 'Taguig' },
  { label: 'Other', value: 'other' }
]

const locationTypeOptions = [
  { label: 'Local (Philippines)', value: 'local' },
  { label: 'International', value: 'international' }
]

const documentStatusOptions = [
  { label: 'Complete Profile', value: 'complete' },
  { label: 'Missing Information', value: 'missing' },
  { label: 'ID Verified', value: 'verified' },
  { label: 'Not Verified', value: 'notverified' }
]

const nameSortOptions = [
  { label: 'Default', value: '' },
  { label: 'A-Z', value: 'az' },
  { label: 'Z-A', value: 'za' }
]

// Filters object
interface GuestFilters {
  search: string
  nameSort: string
  guestStatus: string
  guestType: string
  totalStays: string
  totalSpent: string
  city: string
  locationType: string
  documentStatus: string
  lastVisitFrom: string
  lastVisitTo: string
}

const filters = ref<GuestFilters>({
  search: '',
  nameSort: '',
  guestStatus: '',
  guestType: '',
  totalStays: '',
  totalSpent: '',
  city: '',
  locationType: '',
  documentStatus: '',
  lastVisitFrom: '',
  lastVisitTo: ''
})

// Computed dropdown labels
const guestStatusDropdownLabel = computed(() => {
  const found = guestStatusOptions.find(opt => opt.value === filters.value.guestStatus)
  return found ? found.label : 'All Guests'
})

const guestTypeDropdownLabel = computed(() => {
  const found = guestTypeOptions.find(opt => opt.value === filters.value.guestType)
  return found ? found.label : 'All Types'
})

const totalStaysDropdownLabel = computed(() => {
  const found = totalStaysOptions.find(opt => opt.value === filters.value.totalStays)
  return found ? found.label : 'Total Stays'
})

const totalSpentDropdownLabel = computed(() => {
  const found = totalSpentOptions.find(opt => opt.value === filters.value.totalSpent)
  return found ? found.label : 'Total Spent'
})

const cityDropdownLabel = computed(() => {
  const found = cityOptions.find(opt => opt.value === filters.value.city)
  return found ? found.label : 'City'
})

const locationTypeDropdownLabel = computed(() => {
  const found = locationTypeOptions.find(opt => opt.value === filters.value.locationType)
  return found ? found.label : 'Location Type'
})

const documentStatusDropdownLabel = computed(() => {
  const found = documentStatusOptions.find(opt => opt.value === filters.value.documentStatus)
  return found ? found.label : 'Document Status'
})

const nameSortDropdownLabel = computed(() => {
  const found = nameSortOptions.find(opt => opt.value === filters.value.nameSort)
  return found ? found.label : 'Name Sort'
})

// Filter handlers
function toggleDropdown(name: string) {
  activeDropdown.value = activeDropdown.value === name ? null : name
}

function selectGuestStatus(option: { label: string; value: string }) {
  filters.value.guestStatus = option.value
  activeDropdown.value = null
}

function selectGuestType(option: { label: string; value: string }) {
  filters.value.guestType = option.value
  activeDropdown.value = null
}

function selectTotalStays(option: { label: string; value: string }) {
  filters.value.totalStays = option.value
  activeDropdown.value = null
}

function selectTotalSpent(option: { label: string; value: string }) {
  filters.value.totalSpent = option.value
  activeDropdown.value = null
}

function selectCity(option: { label: string; value: string }) {
  filters.value.city = option.value
  activeDropdown.value = null
}

function selectLocationType(option: { label: string; value: string }) {
  filters.value.locationType = option.value
  activeDropdown.value = null
}

function selectDocumentStatus(option: { label: string; value: string }) {
  filters.value.documentStatus = option.value
  activeDropdown.value = null
}

function selectNameSort(option: { label: string; value: string }) {
  filters.value.nameSort = option.value
  activeDropdown.value = null
}

function handleGuestSearch(query: string) {
  filters.value.search = query
}

function clearAllFilters() {
  filters.value = {
    search: '',
    nameSort: '',
    guestStatus: '',
    guestType: '',
    totalStays: '',
    totalSpent: '',
    city: '',
    locationType: '',
    documentStatus: '',
    lastVisitFrom: '',
    lastVisitTo: ''
  }
}

const hasActiveFilters = computed(() => {
  const f = filters.value
  return !!(f.search || f.nameSort || f.guestStatus || f.guestType ||
    f.totalStays || f.totalSpent || f.city || f.locationType ||
    f.documentStatus || f.lastVisitFrom || f.lastVisitTo)
})

// Store setup
const guestStore = useGuestStore()
const hotelDataStore = useHotelDataStore()
const { guests, loading, error } = storeToRefs(guestStore)
const { reservations } = storeToRefs(hotelDataStore)

// Philippine cities for local detection
const philippineCities = ['Manila', 'Cebu', 'Davao', 'Quezon City', 'Makati', 'Pasig', 'Taguig', 'Caloocan', 'Parañaque', 'Las Piñas', 'Antipolo', 'Bacoor', 'Tarlac', 'Baguio', 'Iloilo', 'Bacolod', 'Cagayan de Oro', 'General Santos', 'Zamboanga']

// Filtered guests computed property
const PAGE_SIZE = 50
const currentPage = ref(1)
const paginatedGuests = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE
  return filteredGuests.value.slice(start, end)
})

const filteredGuests = computed(() => {
  let result = guests.value

  // Search filter
  if (filters.value.search) {
    const q = filters.value.search.toLowerCase()
    result = result.filter(g =>
      (g.firstName && g.firstName.toLowerCase().includes(q)) ||
      (g.lastName && g.lastName.toLowerCase().includes(q)) ||
      (g.middleName && g.middleName.toLowerCase().includes(q)) ||
      (g.email && g.email.toLowerCase().includes(q)) ||
      (g.phone && g.phone.toLowerCase().includes(q)) ||
      (g.address && g.address.toLowerCase().includes(q))
    )
  }

  // Guest Status filter
  if (filters.value.guestStatus) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    result = result.filter(g => {
      const guestReservations = reservations.value.filter(r =>
        String(r.GuestId) === String(g.id) ||
        String(r.guest) === String(g.id) ||
        String(r.guest) === String(g.email)
      )

      switch (filters.value.guestStatus) {
        case 'inhouse': {
          return guestReservations.some(r => {
            const checkIn = new Date(r.checkIn)
            const checkOut = new Date(r.checkOut)
            return checkIn <= now && checkOut >= now
          })
        }
        case 'arrivingToday': {
          return guestReservations.some(r => {
            const checkIn = new Date(r.checkIn)
            return checkIn >= today && checkIn < new Date(today.getTime() + 24 * 60 * 60 * 1000)
          })
        }
        case 'arrivingWeek': {
          return guestReservations.some(r => {
            const checkIn = new Date(r.checkIn)
            return checkIn >= today && checkIn <= weekFromNow
          })
        }
        case 'past': {
          if (!guestReservations.length) return false
          return guestReservations.every(r => new Date(r.checkOut) < now)
        }
        case 'neverCheckedIn': {
          if (!guestReservations.length) return false
          return !guestReservations.some(r => r.status === 'checkedIn' || r.status === 'checkedOut')
        }
        case 'frequent': {
          return guestReservations.length >= 3
        }
        case 'inactive': {
          if (!guestReservations.length) return true
          const lastVisit = guestReservations.reduce((latest, r) => {
            const checkOut = new Date(r.checkOut)
            return checkOut > latest ? checkOut : latest
          }, new Date(0))
          return lastVisit < threeMonthsAgo
        }
        default:
          return true
      }
    })
  }

  // Guest Type filter
  if (filters.value.guestType) {
    result = result.filter(g => {
      const type = getGuestCategory(g).toLowerCase()
      return type === filters.value.guestType.toLowerCase()
    })
  }

  // Total Stays filter
  if (filters.value.totalStays) {
    result = result.filter(g => {
      const stays = getTotalStays(g)
      switch (filters.value.totalStays) {
        case '1': return stays === 1
        case '2-5': return stays >= 2 && stays <= 5
        case '5-10': return stays >= 5 && stays <= 10
        case '10+': return stays >= 10
        default: return true
      }
    })
  }

  // Total Spent filter
  if (filters.value.totalSpent) {
    result = result.filter(g => {
      const spent = getTotalSpent(g)
      const [min, max] = filters.value.totalSpent.split('-').map(Number)
      if (max) {
        return spent >= min && spent <= max
      } else {
        return spent >= min
      }
    })
  }

  // City filter
  if (filters.value.city) {
    result = result.filter(g => {
      const address = g.address || ''
      if (filters.value.city === 'other') {
        return !cityOptions.slice(1, -1).some(opt =>
          address.toLowerCase().includes(opt.value.toLowerCase())
        )
      }
      return address.toLowerCase().includes(filters.value.city.toLowerCase())
    })
  }

  // Location Type filter
  if (filters.value.locationType) {
    result = result.filter(g => {
      const address = g.address || ''
      const g_any = g as any
      const countryCode = g_any.countryCode || ''

      const isLocal = countryCode === 'PH' ||
        countryCode === 'Philippines' ||
        philippineCities.some(city => address.includes(city))

      return filters.value.locationType === 'local' ? isLocal : !isLocal
    })
  }

  // Document Status filter
  if (filters.value.documentStatus) {
    result = result.filter(g => {
      const g_any = g as any
      const hasAllInfo = !!(g.firstName && g.lastName && g.email && g.phone && g.address)
      const hasId = !!g.idDocument
      const isVerified = g_any.verified === true || g_any.idVerified === true

      switch (filters.value.documentStatus) {
        case 'complete': return hasAllInfo && hasId
        case 'missing': return !hasAllInfo || !hasId
        case 'verified': return isVerified
        case 'notverified': return !isVerified
        default: return true
      }
    })
  }

  // Last Visit Date Range filter
  if (filters.value.lastVisitFrom || filters.value.lastVisitTo) {
    result = result.filter(g => {
      const lastVisit = getLastVisitDate(g)
      if (!lastVisit) return false

      if (filters.value.lastVisitFrom) {
        const fromDate = new Date(filters.value.lastVisitFrom)
        if (lastVisit < fromDate) return false
      }

      if (filters.value.lastVisitTo) {
        const toDate = new Date(filters.value.lastVisitTo)
        toDate.setHours(23, 59, 59, 999)
        if (lastVisit > toDate) return false
      }

      return true
    })
  }

  // Name sort
  if (filters.value.nameSort === 'az') {
    result = [...result].sort((a, b) => {
      const nameA = (a.firstName + ' ' + (a.middleName || '') + ' ' + a.lastName).toLowerCase()
      const nameB = (b.firstName + ' ' + (b.middleName || '') + ' ' + b.lastName).toLowerCase()
      return nameA.localeCompare(nameB)
    })
  } else if (filters.value.nameSort === 'za') {
    result = [...result].sort((a, b) => {
      const nameA = (a.firstName + ' ' + (a.middleName || '') + ' ' + a.lastName).toLowerCase()
      const nameB = (b.firstName + ' ' + (b.middleName || '') + ' ' + b.lastName).toLowerCase()
      return nameB.localeCompare(nameA)
    })
  }

  return result
})

// Helper functions
function getGuestCategory(guest: Guest): string {
  return (guest as any).type || 'Regular'
}

function getGuestNationality(guest: Guest): string {
  const g = guest as any
  if (typeof g.countryCode === 'string') return g.countryCode
  if (guest.address) return guest.address
  return 'N/A'
}

function getGuestNotes(guest: Guest): string {
  const g = guest as any
  if (typeof g.notes === 'string') return g.notes
  if (typeof g.tags === 'string') return g.tags
  return ''
}

function getTotalStays(guest: Guest): number {
  const guestId = guest.id ? String(guest.id).trim() : '';
  const guestEmail = guest.email ? String(guest.email).trim().toLowerCase() : '';
  return reservations.value.filter((r: Reservation) => {
    const rGuestId = r.GuestId ? String(r.GuestId).trim() : '';
    const rGuest = r.guest ? String(r.guest).trim() : '';
    return (
      (guestId && (rGuestId === guestId || rGuest === guestId)) ||
      (guestEmail && rGuest.toLowerCase() === guestEmail)
    );
  }).length;
}

function getLastVisitDate(guest: Guest): Date | null {
  const guestReservations = reservations.value.filter((r: Reservation) =>
    String(r.GuestId) === String(guest.id) ||
    String(r.guest) === String(guest.id) ||
    String(r.guest) === String(guest.email)
  )

  if (!guestReservations.length) return null

  let lastDate: Date | null = null
  guestReservations.forEach((r: Reservation) => {
    let out: Date | null = null
    if (r.checkOut) {
      out = typeof r.checkOut === 'string' ? new Date(r.checkOut) : r.checkOut instanceof Date ? r.checkOut : null
    } else if (r.checkOutDate) {
      out = new Date(r.checkOutDate)
    }
    if (out && (!lastDate || out > lastDate)) lastDate = out
  })

  return lastDate
}

function getLastVisit(guest: Guest): string {
  const lastDate = getLastVisitDate(guest)
  if (!lastDate) return 'N/A'
  if (lastDate && typeof lastDate === 'object' && typeof (lastDate as Date).toLocaleDateString === 'function') {
    return (lastDate as Date).toLocaleDateString()
  }
  return 'N/A'
}

function getTotalSpent(guest: Guest): number {
  return reservations.value
    .filter((r: Reservation) =>
      String(r.GuestId) === String(guest.id) ||
      String(r.guest) === String(guest.id) ||
      String(r.guest) === String(guest.email)
    )
    .reduce((sum: number, r: Reservation) => sum + (typeof r.amount === 'number' ? r.amount : 0), 0)
}

function getCurrentStatus(guest: Guest): string {
  const now = new Date()
  const guestReservations = reservations.value.filter((r: Reservation) =>
    String(r.GuestId) === String(guest.id) ||
    String(r.guest) === String(guest.id) ||
    String(r.guest) === String(guest.email)
  )

  if (!guestReservations.length) return 'No Active Reservation'

  const active = guestReservations.find((r: Reservation) => {
    const checkIn = r.checkIn ? new Date(r.checkIn) : r.checkInDate ? new Date(r.checkInDate as string) : null
    const checkOut = r.checkOut ? new Date(r.checkOut) : r.checkOutDate ? new Date(r.checkOutDate as string) : null
    return checkIn && checkOut && checkIn <= now && checkOut >= now
  })

  if (active) return 'In-House'

  guestReservations.sort((a: Reservation, b: Reservation) => {
    const aDate = a.checkOut ? new Date(a.checkOut).getTime() : a.checkOutDate ? new Date(a.checkOutDate as string).getTime() : 0
    const bDate = b.checkOut ? new Date(b.checkOut).getTime() : b.checkOutDate ? new Date(b.checkOutDate as string).getTime() : 0
    return bDate - aDate
  })

  const latest = guestReservations[0]
  if (latest.status === 'checkedOut') return 'Checked-Out'
  if (latest.status === 'confirmed' || latest.status === 'pending') return 'Expected Arrival'
  return 'No Active Reservation'
}

function formatCreatedDate(guest: Guest): string {
  const g = guest as any
  if (!g.createdAt) return 'N/A'

  const date = typeof g.createdAt === 'string' ? new Date(g.createdAt) : g.createdAt instanceof Date ? g.createdAt : null
  return date && !isNaN(date.getTime()) ? date.toLocaleDateString() : 'N/A'
}

// Badge styling functions
function getGuestTypeBadgeClass(guest: Guest): string {
  const type = getGuestCategory(guest).toLowerCase()
  const classes: { [key: string]: string } = {
    'vip': 'bg-purple-100 text-purple-700',
    'corporate': 'bg-blue-100 text-blue-700',
    'regular': 'bg-gray-100 text-gray-700',
    'group': 'bg-green-100 text-green-700',
    'blacklisted': 'bg-red-100 text-red-700'
  }
  return classes[type] || 'bg-gray-100 text-gray-700'
}

function getStatusBadgeClass(guest: Guest): string {
  const status = getCurrentStatus(guest)
  if (status === 'In-House') return 'bg-green-100 text-green-700'
  if (status === 'Expected Arrival') return 'bg-blue-100 text-blue-700'
  if (status === 'Checked-Out') return 'bg-gray-100 text-gray-700'
  return 'bg-gray-50 text-gray-500'
}

// Action button handlers
function viewProfile(guest: Guest) {
  console.log('View profile:', guest)
  // Implement profile view logic
}

function editGuest(guest: Guest) {
  console.log('Edit guest:', guest)
  // Implement edit logic
}

function viewReservations(guest: Guest) {
  console.log('View reservations:', guest)
  // Implement reservations view logic
}

function sendMessage(guest: Guest) {
  console.log('Send message:', guest)
  // Implement messaging logic
}

// Lifecycle
onMounted(() => {
  guestStore.fetchGuests()
  hotelDataStore.fetchReservations()
})
</script>