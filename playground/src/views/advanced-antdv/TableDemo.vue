<script setup lang="ts">
import type { TableColumnType } from 'ant-design-vue'
import { onMounted, ref } from 'vue'
import { useTable } from '@hackycy-kit/advanced-antdv'
import { Button } from 'ant-design-vue'

interface User {
  id: number
  name: string
  email: string
  role: 'Admin' | 'Editor' | 'Viewer'
  status: 'active' | 'inactive'
}

const NAMES = [
  'Alice Chen', 'Bob Zhang', 'Charlie Liu', 'Diana Wang',
  'Eric Zhao', 'Fiona Li', 'George Wu', 'Helen Sun', 'Ivan Lin', 'Judy Gao',
]

const mockUsers: User[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: NAMES[i]!,
  email: `${NAMES[i]!.split(' ')[0]!.toLowerCase()}@example.com`,
  role: (['Admin', 'Editor', 'Viewer'] as const)[i % 3]!,
  status: i % 4 === 1 ? 'inactive' : 'active',
}))

const columns: TableColumnType<User>[] = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Role', dataIndex: 'role', key: 'role' },
  { title: 'Status', dataIndex: 'status', key: 'status' },
]

const [getBindingProps, tableAction, state, UseAntdvTable] = useTable<User>({
  columns,
  showIndexColumn: true,
})

onMounted(() => {
  tableAction.setDataSource(mockUsers)
})

const reloading = ref(false)

async function handleReload() {
  reloading.value = true
  tableAction.setLoading(true)
  await new Promise<void>(r => setTimeout(r, 800))
  tableAction.setDataSource([...mockUsers].sort(() => Math.random() - 0.5))
  tableAction.setLoading(false)
  reloading.value = false
}

function handleClearSelection() {
  tableAction.clearSelectedRowKeys()
}

function handleClearData() {
  tableAction.setDataSource([])
}

function handleRestoreData() {
  tableAction.setDataSource(mockUsers)
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-soft text-sm m-0">
      Wraps <code class="code-val">ant-design-vue</code> Table with auto-pagination,
      API fetching, index column, and row selection management.
    </p>

    <!-- Controls -->
    <div class="demo-card">
      <div class="demo-card-label">Controls</div>
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div class="flex items-center gap-2 flex-wrap">
          <Button :loading="reloading" @click="handleReload">
            Reload (shuffle)
          </Button>
          <Button @click="handleClearData">
            Clear Data
          </Button>
          <Button @click="handleRestoreData">
            Restore
          </Button>
          <Button :disabled="state.selectedRowKeys.value.length === 0" @click="handleClearSelection">
            Clear Selection
          </Button>
        </div>

        <div class="flex items-center gap-4 text-xs text-soft">
          <span>
            <span class="text-brand-light font-semibold font-mono">{{ state.selectedRowKeys.value.length }}</span>
            <span class="ml-1">selected</span>
          </span>
          <span class="text-dim">·</span>
          <span>
            <span class="text-ink font-semibold font-mono">{{ mockUsers.length }}</span>
            <span class="ml-1">rows total</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Table -->
    <UseAntdvTable v-bind="getBindingProps">
      <template #bodyCell="{ column, record }">
        <template v-if="(column as TableColumnType<User>).key === 'status'">
          <span
            class="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
            :class="(record as User).status === 'active'
              ? 'bg-green-50 text-green-700'
              : 'bg-slate-100 text-slate-500'"
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              :class="(record as User).status === 'active' ? 'bg-green-500' : 'bg-slate-400'"
            ></span>
            {{ (record as User).status }}
          </span>
        </template>
        <template v-else-if="(column as TableColumnType<User>).key === 'role'">
          <span
            class="text-xs px-2 py-0.5 rounded font-medium"
            :class="{
              'bg-indigo-50 text-indigo-600': (record as User).role === 'Admin',
              'bg-amber-50 text-amber-700': (record as User).role === 'Editor',
              'bg-slate-100 text-slate-500': (record as User).role === 'Viewer',
            }"
          >{{ (record as User).role }}</span>
        </template>
      </template>
    </UseAntdvTable>
  </div>
</template>
