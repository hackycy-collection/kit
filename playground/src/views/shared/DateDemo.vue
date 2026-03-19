<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatDate, formatDateTime, getCurrentTimezone, getSystemTimezone } from '@hackycy-kit/shared'

type DateFormat =
  | 'YYYY-MM-DD'
  | 'YYYY-MM-DD HH:mm:ss'
  | 'YYYY-MM'
  | 'YYYY'
  | 'HH:mm:ss'
  | 'MM/DD/YYYY'

const now = new Date()
const customDateInput = ref<string>(new Date().toISOString().split('T')[0]!)

const systemTz = getSystemTimezone()
const currentTz = getCurrentTimezone()

const formats: { label: string, format: DateFormat, fn: (d: Date | string) => string }[] = [
  { label: 'formatDate (default)', format: 'YYYY-MM-DD', fn: d => formatDate(d) },
  { label: 'formatDateTime', format: 'YYYY-MM-DD HH:mm:ss', fn: d => formatDateTime(d) },
  { label: 'Year-Month', format: 'YYYY-MM', fn: d => formatDate(d, 'YYYY-MM') },
  { label: 'Year only', format: 'YYYY', fn: d => formatDate(d, 'YYYY') },
  { label: 'Time only', format: 'HH:mm:ss', fn: d => formatDate(d, 'HH:mm:ss') },
  { label: 'US format', format: 'MM/DD/YYYY', fn: d => formatDate(d, 'MM/DD/YYYY') },
]

const customFormatted = computed(() =>
  formats.map(f => ({
    label: f.label,
    format: f.format,
    result: f.fn(customDateInput.value ? new Date(customDateInput.value) : now),
  })),
)
</script>

<template>
  <div class="space-y-4">
    <p class="text-soft text-sm m-0">
      Date utilities from <code class="code-val">@hackycy-kit/shared</code>:
      timezone-aware formatting with <code class="code-val">dayjs</code>.
    </p>

    <div class="grid grid-cols-2 gap-4">
      <!-- Current time -->
      <div class="demo-card">
        <div class="demo-card-label">Current Time</div>
        <div class="space-y-3">
          <div class="p-4 rounded-xl text-center bg-panel border border-line">
            <div class="text-2xl font-mono font-semibold text-brand-light">
              {{ formatDate(now, 'HH:mm:ss') }}
            </div>
            <div class="text-sm text-soft mt-1">{{ formatDate(now) }}</div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-xs text-dim">formatDate(now)</span>
              <span class="code-val">{{ formatDate(now) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-dim">formatDateTime(now)</span>
              <span class="code-val">{{ formatDateTime(now) }}</span>
            </div>
          </div>

          <div class="pt-2 border-t border-line space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-xs text-dim">getSystemTimezone()</span>
              <span class="code-val">{{ systemTz }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-dim">getCurrentTimezone()</span>
              <span class="code-val">{{ currentTz }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Custom date -->
      <div class="demo-card">
        <div class="demo-card-label">Format Custom Date</div>
        <div class="space-y-3">
          <div>
            <label class="text-xs text-dim block mb-1.5">Pick a date</label>
            <input
              v-model="customDateInput"
              type="date"
              class="w-full bg-panel border border-line rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-brand transition-colors"
            />
          </div>

          <div class="space-y-2">
            <div
              v-for="item in customFormatted"
              :key="item.format"
              class="flex items-center justify-between gap-3 py-1.5 border-b border-line last:border-0"
            >
              <div class="min-w-0">
                <div class="text-xs text-dim">{{ item.label }}</div>
                <div class="text-xs text-dim font-mono opacity-60">{{ item.format }}</div>
              </div>
              <span class="code-val flex-shrink-0">{{ item.result }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
