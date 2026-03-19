<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { StorageManager } from '@hackycy-kit/tools/cache'
import { Button, Input, InputNumber } from 'ant-design-vue'

interface StoredEntry {
  key: string
  value: unknown
  expiry?: number
}

const manager = new StorageManager({ prefix: 'demo_' })

const keyInput = ref('')
const valueInput = ref('')
const ttlInput = ref<number | undefined>(undefined)
const getKeyInput = ref('')
const getResult = ref<unknown>(null)
const hasGetResult = ref(false)
const entries = ref<StoredEntry[]>([])

function refreshEntries() {
  const result: StoredEntry[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const fullKey = localStorage.key(i)
    if (fullKey && fullKey.startsWith('demo_')) {
      const shortKey = fullKey.replace('demo_', '')
      const raw = localStorage.getItem(fullKey)
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { value: unknown, expiry?: number }
          result.push({ key: shortKey, value: parsed.value, expiry: parsed.expiry })
        }
        catch {}
      }
    }
  }
  entries.value = result
}

function handleSet() {
  if (!keyInput.value.trim()) return
  const ttlMs = ttlInput.value ? ttlInput.value * 1000 : undefined
  manager.setItem(keyInput.value.trim(), valueInput.value, ttlMs)
  keyInput.value = ''
  valueInput.value = ''
  ttlInput.value = undefined
  refreshEntries()
}

function handleGet() {
  if (!getKeyInput.value.trim()) return
  getResult.value = manager.getItem(getKeyInput.value.trim())
  hasGetResult.value = true
}

function handleRemove(key: string) {
  manager.removeItem(key)
  refreshEntries()
}

function handleClearExpired() {
  manager.clearExpiredItems()
  refreshEntries()
}

function handleClearAll() {
  manager.clear()
  refreshEntries()
}

function formatExpiry(expiry?: number): string {
  if (!expiry) return '—'
  const remaining = Math.round((expiry - Date.now()) / 1000)
  if (remaining <= 0) return 'expired'
  return `${remaining}s`
}

function valuePreview(val: unknown): string {
  if (typeof val === 'string') return `"${val}"`
  return JSON.stringify(val)
}

onMounted(() => {
  refreshEntries()
})
</script>

<template>
  <div class="space-y-4">
    <p class="text-soft text-sm m-0">
      Manages <code class="code-val">localStorage</code> / <code class="code-val">sessionStorage</code>
      with optional TTL (ms), prefix namespacing, and expiry auto-cleanup.
    </p>

    <div class="grid grid-cols-2 gap-4">
      <!-- Set Item -->
      <div class="demo-card">
        <div class="demo-card-label">Set Item</div>
        <div class="space-y-3">
          <div class="space-y-1.5">
            <label class="text-xs text-dim">Key</label>
            <Input
              v-model:value="keyInput"
              placeholder="e.g. userToken"
              size="small"
              @press-enter="handleSet"
            />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs text-dim">Value</label>
            <Input
              v-model:value="valueInput"
              placeholder="e.g. abc123"
              size="small"
              @press-enter="handleSet"
            />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs text-dim">TTL (seconds, optional)</label>
            <InputNumber
              v-model:value="ttlInput"
              placeholder="e.g. 30"
              size="small"
              :min="1"
              style="width: 100%;"
            />
          </div>
          <Button type="primary" size="small" :disabled="!keyInput.trim()" @click="handleSet">
            Set Item
          </Button>
        </div>
      </div>

      <!-- Get Item -->
      <div class="demo-card">
        <div class="demo-card-label">Get Item</div>
        <div class="space-y-3">
          <div class="space-y-1.5">
            <label class="text-xs text-dim">Key</label>
            <Input
              v-model:value="getKeyInput"
              placeholder="e.g. userToken"
              size="small"
              @press-enter="handleGet"
            />
          </div>
          <Button size="small" :disabled="!getKeyInput.trim()" @click="handleGet">
            Get Item
          </Button>
          <div v-if="hasGetResult" class="mt-2 p-3 rounded-lg bg-surface border border-line">
            <div class="text-xs text-dim mb-1">Result</div>
            <div v-if="getResult !== null" class="code-val">{{ valuePreview(getResult) }}</div>
            <div v-else class="text-xs text-red-500">null (not found or expired)</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stored Entries -->
    <div class="demo-card">
      <div class="flex items-center justify-between mb-4">
        <div class="demo-card-label mb-0">
          Stored Entries
          <span class="text-brand-light ml-1">{{ entries.length }}</span>
        </div>
        <div class="flex gap-2">
          <Button size="small" @click="handleClearExpired">Clear Expired</Button>
          <Button size="small" danger @click="handleClearAll">Clear All</Button>
        </div>
      </div>

      <div v-if="entries.length === 0" class="text-center py-8 text-dim text-sm">
        No entries stored. Use <span class="code-val">Set Item</span> above.
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="entry in entries"
          :key="entry.key"
          class="flex items-center justify-between px-3 py-2.5 rounded-lg bg-panel border border-line"
        >
          <div class="flex items-center gap-3 min-w-0">
            <span class="code-val flex-shrink-0">{{ entry.key }}</span>
            <span class="text-soft text-xs truncate">{{ valuePreview(entry.value) }}</span>
          </div>
          <div class="flex items-center gap-3 flex-shrink-0 ml-3">
            <span
              v-if="entry.expiry"
              class="text-xs px-2 py-0.5 rounded font-mono"
              :class="entry.expiry - Date.now() < 5000 ? 'text-red-600 bg-red-50' : 'text-amber-700 bg-amber-50'"
            >
              {{ formatExpiry(entry.expiry) }}
            </span>
            <span v-else class="text-xs text-dim">no expiry</span>
            <button
              class="text-xs text-dim hover:text-red-500 transition-colors cursor-pointer border-0 bg-transparent p-0"
              @click="handleRemove(entry.key)"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
