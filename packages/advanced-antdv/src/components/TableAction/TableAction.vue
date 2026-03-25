<script setup lang="ts">
import type { TableActionItem } from './types';

import { computed } from 'vue';

import { Button, Dropdown, Menu, Space } from 'ant-design-vue';

import ActionItem from './ActionItem.vue';

defineOptions({
  name: 'TableAction',
});

const props = withDefaults(
  defineProps<{
    actions?: TableActionItem[];
    dropdownActions?: TableActionItem[];
    moreText?: string;
    size?: 'small' | 'middle' | 'large'
  }>(),
  {
    actions: () => [],
    dropdownActions: () => [],
    moreText: '更多',
    size: 'small'
  },
);

const visibleActions = computed(() => {
  return props.actions.filter(Boolean);
});

const visibleDropdownActions = computed(() => {
  return props.dropdownActions.filter(Boolean);
});

function getActionKey(action: TableActionItem, index: number) {
  return action.key ?? `${action.label}-${index}`;
}
</script>

<template>
  <Space :size="0" class="table-action">
    <ActionItem
      v-for="(action, index) in visibleActions"
      :key="getActionKey(action, index)"
      :action="action"
      :size="size"
    />

    <Dropdown v-if="visibleDropdownActions.length > 0" trigger="click">
      <Button type="link" :size="size">{{ moreText }}</Button>
      <template #overlay>
        <Menu>
          <ActionItem
            v-for="(action, index) in visibleDropdownActions"
            :key="getActionKey(action, index)"
            :action="action"
            dropdown
          />
        </Menu>
      </template>
    </Dropdown>
  </Space>
</template>
  