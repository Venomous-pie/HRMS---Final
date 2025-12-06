<template>
  <div
    v-if="isCheckoutModalOpen"
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
            label="← Back"
            bg-color="bg-gray-50"
            hover-bg-color="hover:bg-gray-100"
            text-color="text-gray-600"
            :hover="true"
            class="text-xs"
            @click="goBackToDetails"
          />
          <h2 class="text-lg font-medium text-gray-900">Guest Checkout</h2>
          <span v-if="selectedReservation" class="text-xs text-gray-600">
            {{ selectedReservation.guestName || selectedReservation.guest }} - Room {{ selectedReservation.roomNumber }}
          </span>
        </div>
        <button
          @click="closeCheckoutModal"
          class="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          type="button"
        >
          <i class="pi pi-times w-5 h-5"></i>
        </button>
      </div>

      <div v-if="error" class="p-6 pb-0">
        <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
      </div>

      <!-- Bill Summary -->
      <div v-if="checkoutBill" class="p-6 border-b">
        <h3 class="text-sm font-medium text-gray-900 mb-4">Bill Summary</h3>
        <div class="bg-gray-50 rounded-lg p-4 space-y-3">
          <!-- Stay Details -->
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Stay Period:</span>
            <span class="text-gray-900">{{ formatDate(checkoutBill.checkInDate) }} - {{ formatDate(checkoutBill.checkOutDate) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Nights:</span>
            <span class="text-gray-900">{{ checkoutBill.nights }}</span>
          </div>
          <!-- Room Charges -->
          <div class="border-t pt-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Room Rate ({{ checkoutBill.nights }} nights):</span>
              <span class="text-gray-900">{{ formatCurrency(checkoutBill.subtotal) }}</span>
            </div>
          </div>
          <!-- Extra Charges -->
          <div v-if="checkoutBill.extraCharges.length > 0" class="border-t pt-2">
            <h4 class="text-xs font-medium text-gray-700 mb-1">Extra Charges:</h4>
            <div
              v-for="charge in checkoutBill.extraCharges"
              :key="charge.id"
              class="flex justify-between text-sm"
            >
              <span class="text-gray-600">{{ charge.description }}</span>
              <span class="text-gray-900">{{ formatCurrency(charge.amount) }}</span>
            </div>
          </div>
          <!-- Totals -->
          <div class="border-t pt-2 space-y-1">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Subtotal:</span>
              <span class="text-gray-900">{{
                formatCurrency(
                  checkoutBill.subtotal +
                    checkoutBill.extraCharges.reduce((sum, c) => sum + c.amount, 0),
                )
              }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Taxes (12%):</span>
              <span class="text-gray-900">{{ formatCurrency(checkoutBill.taxes) }}</span>
            </div>
            <div class="flex justify-between text-sm font-bold">
              <span class="text-gray-900">Total Amount:</span>
              <span class="text-gray-900">{{ formatCurrency(checkoutBill.totalAmount) }}</span>
            </div>
            <div
              v-if="checkoutBill.paidAmount > 0"
              class="flex justify-between text-sm text-green-600"
            >
              <span>Paid Amount:</span>
              <span>{{ formatCurrency(checkoutBill.paidAmount) }}</span>
            </div>
            <div class="flex justify-between text-sm font-bold text-red-600">
              <span>Balance Due:</span>
              <span>{{ formatCurrency(checkoutBill.balanceAmount) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Extra Charges Section -->
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-900">Additional Charges</h3>
          <Custombutton
            @click="showAddChargeForm = !showAddChargeForm"
            width="130px"
            label="Add Charge"
          />
        </div>

        <!-- Add Charge Form -->
        <div v-if="showAddChargeForm" class="bg-gray-50 rounded-lg p-6 my-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <input
                v-model="newCharge.description"
                type="text"
                class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                placeholder="e.g., Minibar, Late checkout"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Amount</label>
              <input
                v-model.number="newCharge.amount"
                type="number"
                min="0"
                step="1"
                class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select
                v-model="newCharge.category"
                class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
              >
                <option value="minibar">Minibar</option>
                <option value="room_service">Room Service</option>
                <option value="laundry">Laundry</option>
                <option value="phone">Phone</option>
                <option value="damage">Damage</option>
                <option value="late_checkout">Late Checkout</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end mt-4 space-x-2">
            <Custombutton
              label="Cancel"
              bg-color="bg-gray-200"
              hover-bg-color="hover:bg-red-500"
              :hover="true"
              @click="showAddChargeForm = false"
            />
            <Custombutton
              @click="addCharge"
              :disabled="!newCharge.description || !newCharge.amount"
              label="Add"
              width="100px"
            />
          </div>
        </div>

        <!-- Late Checkout Warning -->
        <div
          v-if="isLateCheckout"
          class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"
        >
          <div class="flex">
            <svg class="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            <div>
              <h4 class="text-yellow-800 font-medium">Late Checkout Detected</h4>
              <p class="text-yellow-700 text-sm">
                Guest is checking out past the standard 11:00 AM time. Consider adding late checkout
                fee.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Section -->
      <div class="p-6 border-b">
        <h3 class="text-sm font-medium text-gray-900 mb-4">Payment Details</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              v-model="checkoutForm.paymentMethod"
              class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            >
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Payment Amount</label>
            <input
              v-model.number="checkoutForm.paymentAmount"
              type="number"
              min="0"
              step="0.01"
              class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>
        </div>

        <div class="mt-4">
          <label class="block text-xs font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            v-model="checkoutForm.notes"
            rows="3"
            class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            placeholder="Any additional notes or comments..."
          ></textarea>
        </div>

        <!-- Damage Assessment -->
        <div class="my-4">
          <label class="flex items-center">
            <input
              v-model="checkoutForm.damageAssessment"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-2 text-xs text-gray-700">Room damage assessment required</span>
          </label>

          <div v-if="checkoutForm.damageAssessment" class="mt-3 space-y-3">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Damage Description</label>
              <textarea
                v-model="checkoutForm.damageDescription"
                rows="2"
                class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                placeholder="Describe the damage..."
              ></textarea>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Damage Amount</label>
              <input
                v-model.number="checkoutForm.damageAmount"
                type="number"
                min="0"
                step="0.01"
                class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
        <Custombutton
          label="Cancel"
          bg-color="bg-gray-100"
          hover-bg-color="hover:bg-gray-200"
          text-color="text-gray-700"
          :hover="true"
          @click="closeCheckoutModal"
        />
        <Custombutton
          :label="isProcessing ? 'Processing...' : 'Complete Checkout'"
          bg-color="bg-green-600"
          hover-bg-color="hover:bg-green-700"
          text-color="white"
          :hover="true"
          :disabled="!canProcessCheckout || isProcessing"
          @click="processCheckout"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Custombutton from '@/components/Custombutton.vue'
import { useCheckoutStore } from '@/stores/checkout'
import { storeToRefs } from 'pinia'
import type { ExtraCharge } from '@/composables/useCheckout'

// Define emits
const emit = defineEmits<{
  backToDetails: [reservation: any]
}>()

const checkoutStore = useCheckoutStore()
const {
  isCheckoutModalOpen,
  selectedReservation,
  checkoutBill,
  checkoutForm,
  isProcessing,
  error,
} = storeToRefs(checkoutStore)

// Dummy computed for canProcessCheckout and isLateCheckout
const canProcessCheckout = ref(true)
const isLateCheckout = ref(false)

const closeCheckoutModal = checkoutStore.closeCheckoutModal
const addExtraCharge = () => {}
const processCheckoutAction = async () => {
  return true
}

// Local state for UI
const showAddChargeForm = ref(false)
const newCharge = ref({
  description: '',
  amount: 0,
  category: 'other' as ExtraCharge['category'],
})

// Add new charge
// TODO: Implement addCharge using store
const addCharge = () => {}

// Process checkout with success handling
const processCheckout = async () => {
  try {
    const success = await checkoutStore.processCheckout()
    if (success) {
      // Fetch latest reservation data after checkout
      try {
        const { updateReservation, getReservationById } = await import('@/services/reservations')
        const id = checkoutStore.selectedReservation?.id?.toString() || ''
        // Optionally update status, but backend should already do this
        const updated = await getReservationById(id)
        emit('backToDetails', updated)
      } catch (e) {
        // Fallback: emit current reservation
        emit('backToDetails', checkoutStore.selectedReservation)
      }
      console.log('Checkout completed successfully! Salamat sa pag-stay!')
    } else {
      console.error('Checkout failed:', checkoutStore.error)
    }
  } catch (err) {
    console.error('Error during checkout:', err)
  }
}

// Utility functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeCheckoutModal()
  }
}

const goBackToDetails = () => {
  // Save reservation before closing modal
  const reservation = selectedReservation.value
  closeCheckoutModal()
  emit('backToDetails', reservation)
}
</script>
