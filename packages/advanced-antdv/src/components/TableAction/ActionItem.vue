<script setup lang="ts">
import type { TableActionItem } from './types'

import { Button, Menu } from 'ant-design-vue'

import { computed } from 'vue'

defineOptions({
  name: 'ActionItem',
})

const props = withDefaults(
  defineProps<{
    action: TableActionItem
    dropdown?: boolean
    size?: 'small' | 'middle' | 'large'
  }>(),
  {
    dropdown: false,
  },
)

const componentType = computed(() => {
  return props.dropdown ? Menu.Item : Button
})

const componentProps = computed(() => {
  if (props.dropdown) {
    return {
      disabled: props.action.disabled,
    }
  }

  return {
    danger: props.action.danger,
    disabled: props.action.disabled,
    size: 'small' as const,
    type: 'link' as const,
  }
})

async function handleClick() {
  if (props.action.disabled) {
    return
  }

  await props.action.onClick?.()
}
</script>

<template>
  <component :is="componentType" v-bind="componentProps" @click="handleClick">
    {{ action.label }}
  </component>
</template>
