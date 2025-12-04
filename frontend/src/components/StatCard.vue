<template>
  <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transition-all duration-200 hover:shadow-xl">
    <div class="flex items-center">
      <div :class="['p-3 rounded-xl flex items-center justify-center', iconBg]"><i :class="[icon, 'text-xl']"></i></div>
      <div class="ml-4 min-w-0">
        <p class="text-sm font-medium text-gray-600 truncate">{{ title }}</p>
        <p class="text-2xl font-bold text-gray-900 leading-tight truncate">
          <slot name="value">{{ formattedValue }}</slot>
        </p>
      </div>
    </div>
    <p v-if="subtitle" class="mt-2 text-xs text-gray-500">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: string | number
  icon: string
  iconBg: string
  subtitle?: string
  prefix?: string
  suffix?: string
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: undefined,
  prefix: '',
  suffix: ''
})

const formattedValue = computed(() => `${props.prefix}${props.value}${props.suffix}`)
</script>
