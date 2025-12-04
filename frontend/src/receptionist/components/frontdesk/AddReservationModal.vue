<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50"
    @click="handleBackdropClick"
  >
    <div
      class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-200"
      @click.stop
    >
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div class="flex items-center gap-3">
          <Custombutton
            v-if="isEditing"
            label="← Back"
            bg-color="bg-gray-50"
            hover-bg-color="hover:bg-gray-100"
            text-color="text-gray-600"
            :hover="true"
            @click="goBackToDetails"
          />
          <h2 class="text-lg font-medium text-gray-900">
            {{ isEditing ? 'Update Reservation' : 'Add New Reservation' }}
          </h2>
          <div
            v-if="!isEditing && showSavedIndicator"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200 ml-2 animate-fade-in-out"
            title="Draft automatically saved"
          >
            <i class="pi pi-check w-3 h-3"></i>
            <span>Saved</span>
          </div>
          <div v-if="!isEditing && draftRestored" class="flex items-center gap-2">
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
            >
              <i class="pi pi-history w-3 h-3"></i>
              Draft restored
            </span>
            <button
              @click="discardDraft"
              type="button"
              class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 hover:text-gray-700 transition-colors"
              title="Clear draft and start fresh"
            >
              <i class="pi pi-trash w-3 h-3"></i>
              Clear
            </button>
          </div>
        </div>
        <button 
          @click.stop="closeModal" 
          class="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          type="button"
        >
          <i class="pi pi-times w-5 h-5"></i>
        </button>
      </div>

      <div class="p-6">
        <div v-if="modalState.error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-700">{{ modalState.error }}</p>
        </div>

        <div
          v-if="modalState.success"
          class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg"
        >
          <p class="text-sm text-green-700">Reservation created successfully!</p>
        </div>

        <form @submit.prevent="submitReservation" class="space-y-6">
          <div>
            <h3 class="text-sm font-medium text-gray-900 mb-4">Guest Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  First Name <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.firstName"
                  type="text"
                  class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-green-500"
                  :class="{ 'border-red-300 bg-red-50': errors.firstName }"
                  placeholder="Enter first name"
                  @input="handleFirstNameInput"
                  @blur="validateFirstName"
                />
                <p v-if="errors.firstName" class="mt-1 text-xs text-red-600">
                  {{ errors.firstName }}
                </p>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Last Name <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.lastName"
                  type="text"
                  class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-green-500"
                  :class="{ 'border-red-300 bg-red-50': errors.lastName }"
                  placeholder="Enter last name"
                  @input="handleLastNameInput"
                  @blur="validateLastName"
                />
                <p v-if="errors.lastName" class="mt-1 text-xs text-red-600">
                  {{ errors.lastName }}
                </p>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Middle Name</label>
                <input
                  v-model="formData.middleName"
                  type="text"
                  class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-green-500"
                  :class="{ 'border-red-300 bg-red-50': errors.middleName }"
                  placeholder="Enter middle name (optional)"
                  @input="handleMiddleNameInput"
                />
                <p v-if="errors.middleName" class="mt-1 text-xs text-red-600">
                  {{ errors.middleName }}
                </p>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Email <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.email"
                  type="email"
                  class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-green-500"
                  :class="{ 'border-red-300 bg-red-50': errors.email }"
                  placeholder="Enter email address"
                  @input="handleEmailInput"
                  @blur="validateEmail"
                  @keydown="handleEmailKeydown"
                />
                <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Phone <span class="text-red-500">*</span>
                </label>
                <div class="flex">
                  <select
                    v-model="formData.countryCode"
                    class="px-3 py-2 text-xs border border-gray-50 rounded-l-lg focus:border-green-500 bg-gray-50 border-r-0"
                  >
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+63">🇵🇭 +63</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+86">🇨🇳 +86</option>
                    <option value="+81">🇯🇵 +81</option>
                    <option value="+82">🇰🇷 +82</option>
                    <option value="+65">🇸🇬 +65</option>
                    <option value="+60">🇲🇾 +60</option>
                    <option value="+66">🇹🇭 +66</option>
                    <option value="+84">🇻🇳 +84</option>
                    <option value="+62">🇮🇩 +62</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+64">🇳🇿 +64</option>
                  </select>
                  <input
                    v-model="formData.phone"
                    type="tel"
                    class="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-r-lg focus:border-green-500"
                    :class="{ 'border-red-300 bg-red-50': errors.phone }"
                    placeholder="Enter phone number"
                    @input="formatPhoneInput"
                    @blur="validatePhone"
                  />
                </div>
                <p v-if="errors.phone" class="mt-1 text-xs text-red-600">{{ errors.phone }}</p>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  ID Document <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.idDocument"
                  type="text"
                  class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-green-500 uppercase"
                  :class="{ 'border-red-300 bg-red-50': errors.idDocument }"
                  placeholder="Enter ID/Passport number"
                  @input="handleIdDocumentInput"
                  @blur="validateIdDocument"
                />
                <p v-if="errors.idDocument" class="mt-1 text-xs text-red-600">
                  {{ errors.idDocument }}
                </p>
              </div>
            </div>

            <div class="mt-4">
              <label class="block text-xs font-medium text-gray-700 mb-1">
                Address <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="formData.address"
                rows="2"
                class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-green-500"
                :class="{ 'border-red-300 bg-red-50': errors.address }"
                placeholder="Enter full address"
                @input="handleAddressInput"
                @blur="validateAddress"
              ></textarea>
              <p v-if="errors.address" class="mt-1 text-xs text-red-600">{{ errors.address }}</p>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-900 mb-4">Reservation Details</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Check-in Date <span class="text-red-500">*</span>
                </label>
                <div class="flex gap-2">
                  <input
                    v-model="formData.checkIn"
                    type="date"
                    :min="minDate"
                    class="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-green-500"
                    :class="{ 'border-red-300 bg-red-50': errors.checkIn }"
                    @change="validateDates"
                  />
                  <button
                    type="button"
                    @click="setTodayAsCheckIn"
                    class="px-3 py-2 text-xs bg-gray-50 text-blue-700 border rounded-lg hover:bg-gray-100 transition-colors"
                    title="Set today as check-in date"
                  >
                    Today
                  </button>
                </div>
                <p v-if="errors.checkIn" class="mt-1 text-xs text-red-600">{{ errors.checkIn }}</p>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Check-out Date <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.checkOut"
                  type="date"
                  :min="minCheckOutDate"
                  class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-green-500"
                  :class="{ 'border-red-300 bg-red-50': errors.checkOut }"
                  @change="validateDates"
                />
                <p v-if="errors.checkOut" class="mt-1 text-xs text-red-600">
                  {{ errors.checkOut }}
                </p>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Number of Guests <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="formData.numGuest"
                  class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-800 focus:border-blue-800"
                  :class="{ 'border-red-300 bg-red-50': errors.numGuest }"
                  @change="handleNumGuestChange"
                >
                  <option value="">Select guests</option>
                  <option v-for="num in 10" :key="num" :value="num">
                    {{ num }} {{ num === 1 ? 'Guest' : 'Guests' }}
                  </option>
                </select>
                <p v-if="errors.numGuest" class="mt-1 text-xs text-red-600">
                  {{ errors.numGuest }}
                </p>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Room <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="formData.roomNumber"
                  class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-800 focus:border-blue-800"
                  :class="{ 'border-red-300 bg-red-50': errors.roomNumber }"
                  :disabled="
                    !formData.checkIn ||
                    !formData.checkOut ||
                    !formData.numGuest ||
                    isCheckingAvailability
                  "
                  @change="validateRoomSelectionLocal"
                >
                  <option value="">
                    {{ isCheckingAvailability ? 'Checking availability...' : 'Select room' }}
                  </option>
                  <optgroup
                    v-for="category in roomsByCategory"
                    :key="category.type"
                    :label="category.type"
                  >
                    <option
                      v-for="room in category.rooms"
                      :key="room.number"
                      :value="room.number"
                      :disabled="!isRoomAvailable(room)"
                    >
                      Room {{ room.number }} - ${{ room.pricePerNight }}/night ({{
                        room.maxCapacity
                      }}
                      guests max)
                      {{ !isRoomAvailable(room) ? ' - Unavailable' : '' }}
                    </option>
                  </optgroup>
                </select>
                <p v-if="errors.roomNumber" class="mt-1 text-xs text-red-600">
                  {{ errors.roomNumber }}
                </p>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  v-model="formData.status"
                  class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-800 focus:border-blue-800"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="checkedIn">Checked In</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Estimated Total Price
                  <span class="text-xs font-normal text-gray-500">(system)</span>
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-2 text-xs text-gray-500">$</span>
                  <input
                    v-model="calculatedPrice"
                    type="text"
                    class="w-full pl-6 pr-3 py-2 text-xs border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-green-600"
                    readonly
                    placeholder="Select room and dates"
                    disabled
                  />
                </div>
                <p v-if="nights > 0 && selectedRoomPrice > 0" class="mt-1 text-xs text-gray-500">
                  {{ nights }} {{ nights === 1 ? 'night' : 'nights' }} × ${{
                    selectedRoomPrice
                  }}/night (estimate)
                </p>
                <p
                  v-else-if="!formData.checkIn || !formData.checkOut"
                  class="mt-1 text-xs text-gray-400"
                >
                  Select check-in and check-out dates to see price estimate
                </p>
                <p v-else-if="!formData.roomNumber" class="mt-1 text-xs text-gray-400">
                  Select a room to see price estimate
                </p>
              </div>
            </div>

            <div class="mt-4">
              <label class="block text-xs font-medium text-gray-700 mb-1">Special Requests</label>
              <textarea
                v-model="formData.specialRequest"
                rows="3"
                class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-green-500"
                placeholder="Any special requests or notes..."
              ></textarea>
            </div>

            <div v-if="selectedRoom" class="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 class="text-xs font-medium text-gray-900 mb-2">Selected Room Details</h4>
              <div class="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>Room Number: {{ selectedRoom.number }}</div>
                <div>Room Type: {{ selectedRoom.type }}</div>
                <div>Floor: {{ selectedRoom.floorNumber }}</div>
                <div>Max Capacity: {{ selectedRoom.maxCapacity }} guests</div>
                <div class="col-span-2">
                  <span class="font-medium">Amenities:</span>
                  {{ selectedRoom.amenities?.join(', ') || 'Standard amenities' }}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
        <Custombutton
          label="Cancel"
          bg-color="bg-gray-100"
          hover-bg-color="hover:bg-gray-200"
          text-color="text-gray-700"
          :hover="true"
          @click="closeModal"
        />
        <Custombutton
          :label="isEditing ? 'Update Reservation' : 'Create Reservation'"
          :bg-color="isEditing ? 'bg-blue-600' : 'bg-green-600'"
          :hover-bg-color="isEditing ? 'hover:bg-blue-700' : 'hover:bg-green-700'"
          text-color="white"
          :disabled="modalState.isLoading || !isFormValid"
          :hover="true"
          @click="isEditing ? submitUpdateReservation() : submitReservation()"
        >
          <span v-if="modalState.isLoading" class="flex items-center gap-2">
            <i class="pi pi-spinner pi-spin"></i>
            {{ isEditing ? 'Updating...' : 'Creating...' }}
          </span>
          <span v-else>{{ isEditing ? 'Update Reservation' : 'Create Reservation' }}</span>
        </Custombutton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import Custombutton from '@/components/Custombutton.vue'
import { getTodayAsString } from '@/utils'
import { useHotelData } from '@/composables/useHotelData'
import { useReservationForm } from '@/composables/useReservationForm'
import { useRoomAvailability } from '@/composables/useRoomAvailability'
import { useReservationSubmission } from '@/composables/useReservationSubmission'
import { usePrefilledReservation } from '@/composables/usePrefilledReservation'

// Autosave draft (localStorage) for new reservations
const DRAFT_KEY = 'reservation_draft_v1'
let autosaveTimer: number | null = null
const hasDraft = ref(false)
const draftRestored = ref(false)
const suppressAutosave = ref(false)
const showSavedIndicator = ref(false)
let savedIndicatorTimer: number | null = null
const saveDraftNow = (payload: any) => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ts: Date.now(), data: payload }))
  } catch (e) {
    // ignore quota or serialization errors
  }
}
const clearDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {}
  hasDraft.value = false
  draftRestored.value = false
}
const loadDraft = (): any | null => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const obj = JSON.parse(raw)
    if (!obj || typeof obj !== 'object' || !obj.data) return null
    return obj.data
  } catch {
    return null
  }
}
const scheduleAutosave = (payload: any) => {
  if (autosaveTimer) window.clearTimeout(autosaveTimer)
  autosaveTimer = window.setTimeout(() => {
    saveDraftNow(payload)
    hasDraft.value = true
    // Toggle saved indicator briefly
    if (savedIndicatorTimer) window.clearTimeout(savedIndicatorTimer)
    showSavedIndicator.value = true
    savedIndicatorTimer = window.setTimeout(() => {
      showSavedIndicator.value = false
      savedIndicatorTimer = null
    }, 1500)
  }, 500)
}

interface Props {
  isOpen: boolean
  mode?: 'new' | 'edit'
  prefilledData?: {
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
  } | null
}

interface Emits {
  (e: 'close'): void
  (e: 'success', payload: { reservation: any; roomNumber: string }): void
  (e: 'backToDetails', reservation: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const {
  rooms,
  reservations,
  loading: _hotelLoading,
  error: _hotelError,
  refreshAll,
} = useHotelData()

const {
  formData,
  errors,
  isFormValid,
  validateFirstName,
  validateLastName,
  validateEmail,
  validateIdDocument,
  validateAddress,
  validateNumGuest,
  validateRoomSelection,
  validatePhone,
  validateDates,
  validateForm,
  handleFirstNameInput,
  handleLastNameInput,
  handleMiddleNameInput,
  handleEmailInput,
  handleEmailKeydown,
  handleIdDocumentInput,
  handleAddressInput,
  formatPhoneInput,
  resetForm,
} = useReservationForm()

const isEditing = computed(() => props.mode === 'edit')

const {
  isCheckingAvailability,
  minDate,
  minCheckOutDate,
  nights,
  roomsByCategory,
  selectedRoom,
  selectedRoomPrice,
  calculatedPrice,
  isRoomAvailable,
  filterAvailableRooms,
} = useRoomAvailability(
  rooms,
  reservations,
  formData,
  computed(() => props.prefilledData?.reservationId || null),
)

const prefilledRef = computed(() => props.prefilledData)
const validateRoomSelectionLocal = () => {
  return validateRoomSelection((roomNumber: string) => {
    const room = rooms.value.find((r) => r.number === roomNumber)
    return room ? isRoomAvailable(room) : false
  })
}
const { applyPrefilledData } = usePrefilledReservation(
  prefilledRef,
  rooms,
  formData,
  validateDates,
  () => validateRoomSelectionLocal(),
  isRoomAvailable,
  filterAvailableRooms,
)

const validateFormWithDates = () => {
  const base = validateForm()
  validateDates()
  const noDateErrors = !(errors.value.checkIn || errors.value.checkOut)
  return base && noDateErrors && Object.keys(errors.value).length === 0
}
const { modalState, submitReservation } = useReservationSubmission(
  formData,
  validateFormWithDates,
  () => {
    clearDraft()
  },
  (reservation) => {
    emit('success', { reservation, roomNumber: formData.value.roomNumber })
  },
  () => {
    resetForm()
    closeModal()
  },
)

import { updateReservation } from '@/services/reservations'
const submitUpdateReservation = async () => {
  if (!validateFormWithDates()) return
  modalState.value.isLoading = true
  modalState.value.error = null
  try {
    const payload: any = {
      // Reservation fields
      status: formData.value.status,
      checkIn: formData.value.checkIn,
      checkOut: formData.value.checkOut,
      numGuest: formData.value.numGuest,
      specialRequest: formData.value.specialRequest || '',
      totalPrice: Number(calculatedPrice.value || 0),
      roomNumber: formData.value.roomNumber, // include desired room change
      // Guest fields (optional)
      firstName: formData.value.firstName,
      middleName: formData.value.middleName || '',
      lastName: formData.value.lastName,
      email: formData.value.email,
      phone: formData.value.phone,
      address: formData.value.address,
      idDocument: formData.value.idDocument,
    }
    const id = props.prefilledData?.reservationId as string
    const data = await updateReservation(id, payload)
    modalState.value.success = true
    emit('success', {
      reservation: data.reservation || data,
      roomNumber: formData.value.roomNumber,
    })
    setTimeout(() => {
      resetForm()
      closeModal()
    }, 1500)
    return data.reservation || data
  } catch (error: any) {
    const { ApiClientError } = await import('@/services/apiClient')
    if (error instanceof ApiClientError) {
      if (error.status === 409) {
        modalState.value.error = `Room conflict: ${error.data?.error || 'Room is not available for the chosen dates'}`
      } else {
        modalState.value.error =
          (error.data?.error as string) || error.message || 'Failed to update reservation'
      }
    } else {
      modalState.value.error = 'Network error. Please try again.'
    }
  } finally {
    modalState.value.isLoading = false
  }
}

const setTodayAsCheckIn = () => {
  formData.value.checkIn = getTodayAsString()
  validateDates()
}

const handleNumGuestChange = () => {
  validateNumGuest()
  if (formData.value.roomNumber) {
    const currentRoom = rooms.value.find((room) => room.number === formData.value.roomNumber)
    if (currentRoom && !isRoomAvailable(currentRoom)) {
      formData.value.roomNumber = ''
    }
  }
  filterAvailableRooms()
}

const closeModal = () => {
  console.log('🔄 AddReservationModal: Closing modal...') // Debug log
  modalState.value.error = null
  modalState.value.success = false
  modalState.value.isLoading = false
  
  // Actually close the modal by emitting to parent
  emit('close')
}

const goBackToDetails = () => {
  const reservation = props.prefilledData
  closeModal()
  emit('backToDetails', reservation)
}

const discardDraft = () => {
  // Prevent autosave from immediately resaving the cleared form
  suppressAutosave.value = true
  clearDraft()
  resetForm()
  hasDraft.value = false
  draftRestored.value = false
  if (savedIndicatorTimer) window.clearTimeout(savedIndicatorTimer)
  showSavedIndicator.value = false
  setTimeout(() => {
    suppressAutosave.value = false
  }, 0)
}

const handleBackdropClick = (event: MouseEvent) => {
  console.log('🔄 AddReservationModal: Backdrop clicked', event.target === event.currentTarget) // Debug log
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

// ESC key handler
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    console.log('🔄 AddReservationModal: ESC key pressed - closing modal')
    closeModal()
  }
}

// Add/remove ESC key listener
onMounted(() => {
  document.addEventListener('keydown', handleEscKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey)
})

let lastMode: 'new' | 'edit' | null = null

watch(
  () => props.isOpen,
  async (newValue, oldValue) => {
    if (newValue) {
      await refreshAll()

      // Reset form when switching from edit to new mode
      if (!isEditing.value && lastMode === 'edit') {
        resetForm()
      }
      lastMode = isEditing.value ? 'edit' : 'new'

      if (isEditing.value) {
        // Edit mode - reset form first, then apply prefilled data
        resetForm()
        setTimeout(() => {
          applyPrefilledData()
          filterAvailableRooms()
        }, 100)
      } else {
        // New reservation flow
        resetForm()
        setTimeout(() => {
          // Prioritize prefilled data from grid clicks over drafts
          if (props.prefilledData) {
            // Fresh prefilled data from grid click - apply it and clear any conflicting draft
            applyPrefilledData()
            hasDraft.value = false
            draftRestored.value = false
            filterAvailableRooms()
          } else {
            // No prefilled data - try to restore draft
            const draft = loadDraft()
            if (draft) {
              Object.assign(formData.value, draft)
              draftRestored.value = true
              hasDraft.value = true
              filterAvailableRooms()
            } else {
              hasDraft.value = false
              draftRestored.value = false
            }
          }
        }, 50)
      }
    }
  },
)

watch([() => formData.value.checkIn, () => formData.value.checkOut], () => {
  if (formData.value.checkIn && formData.value.checkOut) {
    filterAvailableRooms()
  }
})

watch(
  () => formData.value.countryCode,
  () => {
    if (formData.value.phone) {
      formatPhoneInput()
      validatePhone()
    }
  },
)

onMounted(() => {
  if (props.isOpen) {
    refreshAll()
  }
})

// Autosave watcher: only in new mode while modal is open
watch(
  formData,
  () => {
    if (!props.isOpen) return
    if (isEditing.value) return
    if (suppressAutosave.value) return
    // Save only minimal but complete payload
    const payload = { ...formData.value }
    scheduleAutosave(payload)
  },
  { deep: true },
)
</script>

<style scoped>
@keyframes fade-in-out {
  0% {
    opacity: 0;
    transform: translateY(-2px);
  }
  20%,
  80% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-2px);
  }
}

.animate-fade-in-out {
  animation: fade-in-out 1.5s ease-in-out;
}
</style>
