<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <div class="flex items-center">
      <div :class="['p-2 rounded-lg flex items-center justify-center', iconBg]"><i :class="[icon, 'text-lg']"></i></div>
      <div class="ml-3 min-w-0">
        <p class="text-xs font-medium text-gray-600 truncate">{{ title }}</p>
        <p class="text-xl font-bold text-gray-900 leading-tight truncate">
          <slot name="value">{{ formattedValue }}</slot>
        </p>
      </div>
    </div>
    <p v-if="subtitle" class="mt-1 text-xs text-gray-500">{{ subtitle }}</p>
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
