<template>
  <div class="flex flex-col w-[15%] bg-gray-50 h-screen overflow-auto overflow-x-hidden">
    <div class="flex items-center w-full h-16 p-2 gap-2">
      <img src="/logo.png" class="h-16 object-contain" alt="Logo" />
      <p class="text-2xl font-bold text-gray-700 font-cursive">Grand Resort</p>
    </div>

    <div class="flex w-full items-center p-2 rounded-lg pl-5 mr-5 mt-4">
      <div class="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
        <i class="pi pi-user text-white text-sm"></i>
      </div>

      <div class="ml-3 leading-tight flex-1">
        <p class="text-sm font-semibold text-black" v-if="currentUser">
          {{ currentUser.firstName }} {{ currentUser.lastName }}
        </p>
        <p class="text-xs text-gray-500 capitalize" v-if="currentUser">
          {{ currentUser.role }}
        </p>
      </div>
    </div>

    <div class="w-full p-3 space-y-2 bg-gray-50 mt-4">
      <p class="text-xs pl-4 font-bold text-gray-700">Daily Operations</p>
      <nav class="flex flex-col space-y-1 mr-7">
        <RouterLink to="/frontdesk" custom v-slot="{ href, navigate, isActive }">
          <a
            :href="href"
            @click="navigate"
            :class="[
              'flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-gray-200 text-xs transition-colors no-underline',
              isActive ? 'bg-gray-100 text-green-900' : 'text-black hover:text-gray-900',
            ]"
          >
            <i class="pi pi-th-large text-sm"></i>
            Front Desk
          </a>
        </RouterLink>
        <RouterLink to="/reservations" custom v-slot="{ href, navigate, isActive }" v-if="canViewReservations">
          <a
            :href="href"
            @click="navigate"
            :class="[
              'flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-gray-200 text-xs transition-colors no-underline',
              isActive ? 'bg-gray-100 text-green-900' : 'text-black hover:text-gray-900',
            ]"
          >
            <i class="pi pi-calendar-plus text-sm"></i>
            Reservations
          </a>
        </RouterLink>
        <RouterLink to="/guests" custom v-slot="{ href, navigate, isActive }" v-if="canViewGuests">
          <a
            :href="href"
            @click="navigate"
            :class="[
              'flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-gray-200 text-xs transition-colors no-underline',
              isActive ? 'bg-gray-100 text-green-900' : 'text-black hover:text-gray-900',
            ]"
          >
            <i class="pi pi-users text-sm"></i>
            Guests
          </a>
        </RouterLink>
        <RouterLink to="/housekeeping" custom v-slot="{ href, navigate, isActive }" v-if="canViewHousekeeping">
          <a
            :href="href"
            @click="navigate"
            :class="[
              'flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-gray-200 text-xs transition-colors no-underline',
              isActive ? 'bg-gray-100 text-green-900' : 'text-black hover:text-gray-900',
            ]"
          >
            <i class="pi pi-home text-sm"></i>
            Housekeeping
          </a>
        </RouterLink>
        <RouterLink to="/tasks" custom v-slot="{ href, navigate, isActive }">
          <a
            :href="href"
            @click="navigate"
            :class="[
              'flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-gray-200 text-xs transition-colors no-underline',
              isActive ? 'bg-gray-100 text-green-900' : 'text-black hover:text-gray-900',
            ]"
          >
            <i class="pi pi-list text-sm"></i>
            Tasks
          </a>
        </RouterLink>
      </nav>
    </div>

    <div v-if="canViewDocuments" class="w-full p-3 space-y-2 bg-gray-50">
      <p class="text-xs pl-4 font-bold text-gray-700">Documents</p>
      <nav class="flex flex-col space-y-1 mr-7">
        <a
          href="http://localhost:8000/booking"
          class="flex items-center gap-2 px-4 py-1.5 rounded-full text-black hover:bg-gray-200 hover:text-gray-900 text-xs transition-colors no-underline"
        >
          <i class="pi pi-globe text-sm"></i>
          Online Booking
        </a>
        <RouterLink to="/accounting" custom v-slot="{ href, navigate, isActive }" v-if="canViewAccounting">
          <a
            :href="href"
            @click="navigate"
            :class="[
              'flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-gray-200 text-xs transition-colors no-underline',
              isActive ? 'bg-gray-100 text-green-900' : 'text-black hover:text-gray-900',
            ]"
          >
            <i class="pi pi-calculator text-sm"></i>
            Accounting
          </a>
        </RouterLink>
        <RouterLink to="/cashbooks" custom v-slot="{ href, navigate, isActive }">
          <a
            :href="href"
            @click="navigate"
            :class="[
              'flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-gray-200 text-xs transition-colors no-underline',
              isActive ? 'bg-gray-100 text-green-900' : 'text-black hover:text-gray-900',
            ]"
          >
            <i class="pi pi-book text-sm"></i>
            Cashbooks
          </a>
        </RouterLink>
        <RouterLink to="/reports" custom v-slot="{ href, navigate, isActive }" v-if="canViewReports">
          <a
            :href="href"
            @click="navigate"
            :class="[
              'flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-gray-200 text-xs transition-colors no-underline',
              isActive ? 'bg-gray-100 text-green-900' : 'text-black hover:text-gray-900',
            ]"
          >
            <i class="pi pi-file-o text-sm"></i>
            Reports
          </a>
        </RouterLink>
      </nav>
    </div>

    <div class="w-full p-3 space-y-2 bg-gray-50">
      <p class="text-xs pl-4 font-bold text-gray-700">InHouse</p>
      <nav class="flex flex-col space-y-1 mr-7">
        <RouterLink to="/orders" custom v-slot="{ href, navigate, isActive }">
          <a
            :href="href"
            @click="navigate"
            :class="[
              'flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-gray-200 text-xs transition-colors no-underline',
              isActive ? 'bg-gray-100 text-green-900' : 'text-black hover:text-gray-900',
            ]"
          >
            <i class="pi pi-shopping-cart text-sm"></i>
            Orders
          </a>
        </RouterLink>
        <RouterLink to="/services" custom v-slot="{ href, navigate, isActive }">
          <a
            :href="href"
            @click="navigate"
            :class="[
              'flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-gray-200 text-xs transition-colors no-underline',
              isActive ? 'bg-gray-100 text-green-900' : 'text-black hover:text-gray-900',
            ]"
          >
            <i class="pi pi-wrench text-sm"></i>
            Services
          </a>
        </RouterLink>
      </nav>
    </div>

    <div class="w-52 mt-auto p-4 bg-gray-50">
      <RouterLink to="/settings" custom v-slot="{ href, navigate, isActive }">
        <a
          :href="href"
          @click="navigate"
          :class="[
            'flex items-center gap-2 px-4 py-1.5 rounded-full hover:bg-gray-200 text-xs transition-colors no-underline',
            isActive ? 'bg-gray-100 text-green-900' : 'text-black hover:text-gray-900',
          ]"
        >
          <i class="pi pi-cog text-sm"></i>
          Settings
        </a>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import { hasPermission, hasRole, isAdminOrManager } from '../utils/permissions'

const { currentUser, logout } = useAuth()

// Role-based visibility
const canViewReservations = computed(() => hasPermission(currentUser.value?.role, 'RESERVATIONS_VIEW_ALL') || hasPermission(currentUser.value?.role, 'RESERVATIONS_VIEW_OWN'))
const canViewGuests = computed(() => hasPermission(currentUser.value?.role, 'GUESTS_VIEW_ALL') || hasPermission(currentUser.value?.role, 'GUESTS_VIEW_LIMITED'))
const canViewHousekeeping = computed(() => hasRole(currentUser.value?.role, 'housekeeping', 'admin', 'manager'))
const canViewAccounting = computed(() => hasRole(currentUser.value?.role, 'accounting', 'admin', 'manager'))
const canViewReports = computed(() => hasPermission(currentUser.value?.role, 'REPORTS_VIEW_OCCUPANCY') || hasPermission(currentUser.value?.role, 'REPORTS_LIMITED_OVERVIEW'))
const canViewDocuments = computed(() => isAdminOrManager(currentUser.value?.role))

// Logout functionality removed - use header dropdown instead 💯
</script>
