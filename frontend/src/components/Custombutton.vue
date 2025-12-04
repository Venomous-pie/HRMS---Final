<template>
  <button
    :type="type"
    :class="[
      'transition-colors font-medium',
      rounded ? 'rounded-full' : 'rounded-lg',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      textClass,
      bgColor,
      hover && !disabled ? hoverBgColor : '',
    ]"
    :style="{
      color: textColor,
      fontSize,
      padding,
      width,
      height,
    }"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  type?: 'button' | 'submit' | 'reset'
  bgColor?: string // e.g. "bg-green-600"
  hoverBgColor?: string // e.g. "hover:bg-green-800"
  textColor?: string
  fontSize?: string
  padding?: string
  width?: string
  height?: string
  rounded?: boolean
  textClass?: string
  disabled?: boolean
  hover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Button',
  type: 'button',
  bgColor: 'bg-green-600',
  hoverBgColor: 'hover:bg-green-800',
  textColor: 'white',
  fontSize: '0.75rem',
  padding: '0.5rem 1rem',
  width: 'auto',
  height: 'auto',
  rounded: true,
  textClass: '',
  disabled: false,
  hover: true,
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  // Only emit click event for non-submit buttons
  // Submit buttons should rely on form submission instead
  if (props.type !== 'submit') {
    emit('click')
  }
}
</script>
