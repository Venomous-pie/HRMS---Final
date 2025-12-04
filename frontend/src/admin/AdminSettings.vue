<template>
  <AdminLayout page-title="Admin Settings">
    <!-- Page Controls -->
    <div class="px-6 py-2">
      <div class="flex items-center justify-between">
        <Searchbar
          placeholder="Search settings..."
          icon="pi pi-search"
          :outline="false"
          @search="handleSettingsSearch"
          width="20rem"
        />
        <div class="flex items-center gap-4">
          <Custombutton 
            label="Save Changes" 
            bg-color="bg-green-600"
            hover-bg-color="hover:bg-green-700"
            text-color="text-white"
            :hover="true"
            @click="saveSettings"
          />
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="px-6 py-2 overflow-y-auto h-full">
      <!-- Settings Categories -->
      <div class="mb-8">
        <!-- Hotel Information -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-6">
            <i class="pi pi-building text-blue-600 text-lg"></i>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Hotel Information</h3>
              <p class="text-sm text-gray-600">Basic hotel details and contact info</p>
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Hotel Name</label>
              <input 
                v-model="hotelSettings.name"
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Grand Resort"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea 
                v-model="hotelSettings.address"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Hotel address..."
              ></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input 
                  v-model="hotelSettings.phone"
                  type="tel" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+63 123 456 7890"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  v-model="hotelSettings.email"
                  type="email" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="info@grandresort.com"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- System Preferences -->
        <div class="mb-8 border-t border-gray-200 pt-8">
          <div class="flex items-center gap-3 mb-6">
            <i class="pi pi-cog text-purple-600 text-lg"></i>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">System Preferences</h3>
              <p class="text-sm text-gray-600">Application behavior settings</p>
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
              <select 
                v-model="systemSettings.currency"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="PHP">Philippine Peso (₱)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <select 
                v-model="systemSettings.timezone"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
                <option value="UTC">UTC (GMT+0)</option>
                <option value="America/New_York">America/New_York (GMT-5)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
              <select 
                v-model="systemSettings.dateFormat"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Booking Settings -->
      <div class="mb-8">
        <!-- Booking Rules -->
        <div class="mb-8 border-t border-gray-200 pt-8">
          <div class="flex items-center gap-3 mb-6">
            <i class="pi pi-calendar text-green-600 text-lg"></i>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Booking Rules</h3>
              <p class="text-sm text-gray-600">Reservation policies and limits</p>
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Maximum Advance Booking (days)</label>
              <input 
                v-model.number="bookingSettings.maxAdvanceBooking"
                type="number" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="365"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Minimum Stay (nights)</label>
              <input 
                v-model.number="bookingSettings.minStay"
                type="number" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Check-in Time</label>
              <input 
                v-model="bookingSettings.checkInTime"
                type="time" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Check-out Time</label>
              <input 
                v-model="bookingSettings.checkOutTime"
                type="time" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <!-- Payment Settings -->
        <div class="mb-8 border-t border-gray-200 pt-8">
          <div class="flex items-center gap-3 mb-6">
            <i class="pi pi-credit-card text-orange-600 text-lg"></i>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Payment Settings</h3>
              <p class="text-sm text-gray-600">Payment methods and policies</p>
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
              <input 
                v-model.number="paymentSettings.taxRate"
                type="number" 
                step="0.01"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="12.00"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Service Charge (%)</label>
              <input 
                v-model.number="paymentSettings.serviceCharge"
                type="number" 
                step="0.01"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="10.00"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">Accepted Payment Methods</label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input 
                    v-model="paymentSettings.acceptCash"
                    type="checkbox" 
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Cash</span>
                </label>
                <label class="flex items-center">
                  <input 
                    v-model="paymentSettings.acceptCard"
                    type="checkbox" 
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Credit/Debit Card</span>
                </label>
                <label class="flex items-center">
                  <input 
                    v-model="paymentSettings.acceptTransfer"
                    type="checkbox" 
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Bank Transfer</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Security Settings -->
      <div class="border-t border-gray-200 pt-8 mb-8">
        <div class="flex items-center gap-3 mb-6">
          <i class="pi pi-shield text-red-600 text-lg"></i>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Security Settings</h3>
            <p class="text-sm text-gray-600">User authentication and access control</p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
              <input 
                v-model.number="securitySettings.sessionTimeout"
                type="number" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="30"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Password Min Length</label>
              <input 
                v-model.number="securitySettings.passwordMinLength"
                type="number" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="8"
              />
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">Security Options</label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input 
                    v-model="securitySettings.requireStrongPassword"
                    type="checkbox" 
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Require Strong Passwords</span>
                </label>
                <label class="flex items-center">
                  <input 
                    v-model="securitySettings.enableTwoFactor"
                    type="checkbox" 
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Enable Two-Factor Authentication</span>
                </label>
                <label class="flex items-center">
                  <input 
                    v-model="securitySettings.logFailedAttempts"
                    type="checkbox" 
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Log Failed Login Attempts</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdminLayout from './AdminLayout.vue'
import Searchbar from '@/components/Searchbar.vue'
import Custombutton from '@/components/Custombutton.vue'

const hotelSettings = ref({
  name: 'Grand Resort',
  address: '123 Beach Boulevard, Boracay Island, Aklan, Philippines',
  phone: '+63 123 456 7890',
  email: 'info@grandresort.com'
})

const systemSettings = ref({
  currency: 'PHP',
  timezone: 'Asia/Manila',
  dateFormat: 'MM/DD/YYYY'
})

const bookingSettings = ref({
  maxAdvanceBooking: 365,
  minStay: 1,
  checkInTime: '15:00',
  checkOutTime: '12:00'
})

const paymentSettings = ref({
  taxRate: 12.00,
  serviceCharge: 10.00,
  acceptCash: true,
  acceptCard: true,
  acceptTransfer: true
})

const securitySettings = ref({
  sessionTimeout: 30,
  passwordMinLength: 8,
  requireStrongPassword: true,
  enableTwoFactor: false,
  logFailedAttempts: true
})

const handleSettingsSearch = (query: string) => {
  console.log('Searching settings:', query)
}

const saveSettings = () => {
  console.log('Saving settings...', {
    hotel: hotelSettings.value,
    system: systemSettings.value,
    booking: bookingSettings.value,
    payment: paymentSettings.value,
    security: securitySettings.value
  })
}
</script>
