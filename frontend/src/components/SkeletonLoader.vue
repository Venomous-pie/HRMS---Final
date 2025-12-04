<template>
  <div
    class="animate-pulse"
    :class="containerClasses"
  >
    <!-- Text Lines -->
    <template v-if="type === 'text'">
      <div
        v-for="i in lines"
        :key="i"
        class="h-4 rounded"
        :class="[
          skeletonClasses,
          i === lines ? lastLineClasses : 'mb-2'
        ]"
      ></div>
    </template>

    <!-- Card Layout -->
    <template v-else-if="type === 'card'">
      <div class="p-4 border rounded-lg" :class="cardClasses">
        <!-- Header -->
        <div v-if="showHeader" class="flex items-center space-x-4 mb-4">
          <div class="w-10 h-10 rounded-full" :class="skeletonClasses"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 rounded w-3/4" :class="skeletonClasses"></div>
            <div class="h-3 rounded w-1/2" :class="skeletonClasses"></div>
          </div>
        </div>

        <!-- Content -->
        <div class="space-y-3">
          <div
            v-for="i in lines"
            :key="i"
            class="h-4 rounded"
            :class="[
              skeletonClasses,
              i === 1 ? 'w-full' : i === lines ? 'w-3/4' : 'w-full'
            ]"
          ></div>
        </div>

        <!-- Actions -->
        <div v-if="showActions" class="flex space-x-2 mt-4">
          <div class="h-8 w-16 rounded" :class="skeletonClasses"></div>
          <div class="h-8 w-20 rounded" :class="skeletonClasses"></div>
        </div>
      </div>
    </template>

    <!-- Table Rows -->
    <template v-else-if="type === 'table'">
      <div
        v-for="row in rows"
        :key="row"
        class="flex items-center space-x-4 py-3 border-b last:border-b-0"
        :class="tableRowClasses"
      >
        <div
          v-for="col in columns"
          :key="col"
          class="h-4 rounded flex-1"
          :class="[
            skeletonClasses,
            col === 1 ? 'w-1/6' : col === columns ? 'w-1/4' : 'w-1/5'
          ]"
        ></div>
      </div>
    </template>

    <!-- Avatar with Text -->
    <template v-else-if="type === 'avatar'">
      <div class="flex items-center space-x-3">
        <div
          class="rounded-full"
          :class="[skeletonClasses, avatarSizeClasses]"
        ></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 rounded w-3/4" :class="skeletonClasses"></div>
          <div class="h-3 rounded w-1/2" :class="skeletonClasses"></div>
        </div>
      </div>
    </template>

    <!-- Button -->
    <template v-else-if="type === 'button'">
      <div
        class="h-10 rounded"
        :class="[skeletonClasses, buttonWidthClasses]"
      ></div>
    </template>

    <!-- Image -->
    <template v-else-if="type === 'image'">
      <div
        class="rounded-lg"
        :class="[skeletonClasses, imageSizeClasses]"
      ></div>
    </template>

    <!-- Custom Rectangle -->
    <template v-else>
      <div
        class="rounded"
        :class="[skeletonClasses, customSizeClasses]"
      ></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'text' | 'card' | 'table' | 'avatar' | 'button' | 'image' | 'rectangle'
  lines?: number
  rows?: number
  columns?: number
  width?: string | number
  height?: string | number
  variant?: 'light' | 'dark'
  showHeader?: boolean
  showActions?: boolean
  avatarSize?: 'sm' | 'md' | 'lg' | 'xl'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  lines: 3,
  rows: 5,
  columns: 4,
  width: undefined,
  height: undefined,
  variant: 'light',
  showHeader: true,
  showActions: true,
  avatarSize: 'md',
  class: ''
})

const skeletonClasses = computed(() => ({
  'bg-gray-200': props.variant === 'light',
  'bg-gray-700': props.variant === 'dark'
}))

const containerClasses = computed(() => [
  props.class,
  {
    'space-y-2': props.type === 'text',
  }
])

const cardClasses = computed(() => ({
  'border-gray-200 bg-white': props.variant === 'light',
  'border-gray-700 bg-gray-800': props.variant === 'dark'
}))

const tableRowClasses = computed(() => ({
  'border-gray-200': props.variant === 'light',
  'border-gray-700': props.variant === 'dark'
}))

const lastLineClasses = computed(() => ({
  'w-3/4': true
}))

const avatarSizeClasses = computed(() => ({
  'w-8 h-8': props.avatarSize === 'sm',
  'w-10 h-10': props.avatarSize === 'md',
  'w-12 h-12': props.avatarSize === 'lg',
  'w-16 h-16': props.avatarSize === 'xl'
}))

const buttonWidthClasses = computed(() => {
  if (props.width) {
    return typeof props.width === 'number' ? `w-${props.width}` : props.width
  }
  return 'w-24'
})

const imageSizeClasses = computed(() => {
  const width = props.width ? (typeof props.width === 'number' ? `w-${props.width}` : props.width) : 'w-full'
  const height = props.height ? (typeof props.height === 'number' ? `h-${props.height}` : props.height) : 'h-48'
  return `${width} ${height}`
})

const customSizeClasses = computed(() => {
  const width = props.width ? (typeof props.width === 'number' ? `w-${props.width}` : props.width) : 'w-full'
  const height = props.height ? (typeof props.height === 'number' ? `h-${props.height}` : props.height) : 'h-4'
  return `${width} ${height}`
})
</script>