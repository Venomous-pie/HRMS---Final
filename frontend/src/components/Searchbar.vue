<template>
  <div
    class="flex items-center px-3 py-2 rounded-xl"
    :class="[outline ? 'outline outline-1 outline-gray-200' : '']"
    :style="{
      width,
      height,
      color: textColor,
      backgroundColor: bgColor,
    }"
  >
    <i v-if="icon" :class="icon + ' mr-2'" :style="{ color: iconColor, fontSize: iconSize }"></i>

    <input
      :type="type"
      :placeholder="placeholder"
      v-model="modelValueProxy"
      class="bg-transparent border-none outline-none flex-1 caret-blue-500"
      :class="inputClass"
      :style="{
        fontSize,
        color: textColor,
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: string
  width?: string
  height?: string
  textColor?: string
  bgColor?: string
  placeholder?: string
  type?: string
  fontSize?: string
  icon?: string // e.g. "pi pi-search"
  iconColor?: string
  iconSize?: string
  inputClass?: string
  outline?: boolean // new prop
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  width: '17rem', // ~w-68
  height: 'auto',
  textColor: '#374151', // gray-700
  bgColor: '#F9FAFB', // gray-50
  placeholder: 'Enter text',
  type: 'text',
  fontSize: '0.75rem', // text-xs
  icon: '',
  iconColor: '#9CA3AF', // gray-400
  iconSize: '0.75rem',
  inputClass: '',
  outline: true, // default is true
})

const emit = defineEmits(['update:modelValue', 'search'])
const modelValueProxy = computed({
  get: () => props.modelValue,
  set: (val: string) => {
    emit('update:modelValue', val)
    emit('search', val)
  },
})
</script>
