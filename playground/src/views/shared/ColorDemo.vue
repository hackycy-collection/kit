<script setup lang="ts">
import { computed, ref } from 'vue'
import { convertToHsl, convertToHslCssVar, convertToRgb, isDarkColor, isLightColor, isValidColor } from '@hackycy-kit/shared'

const colorInput = ref('#6366f1')

const isValid = computed(() => isValidColor(colorInput.value))
const isDark = computed(() => isValid.value && isDarkColor(colorInput.value))
const isLight = computed(() => isValid.value && isLightColor(colorInput.value))
const hsl = computed(() => isValid.value ? convertToHsl(colorInput.value) : '—')
const hslVar = computed(() => isValid.value ? convertToHslCssVar(colorInput.value) : '—')
const rgb = computed(() => isValid.value ? convertToRgb(colorInput.value) : '—')

const swatchPresets = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f97316',
  '#eab308', '#22c55e', '#06b6d4', '#0ea5e9',
  '#64748b', '#1e293b',
]
</script>

<template>
  <div class="space-y-4">
    <p class="text-soft text-sm m-0">
      Color utilities from <code class="code-val">@hackycy-kit/shared</code>:
      detection, HSL/RGB conversion, and CSS variable generation.
    </p>

    <div class="grid grid-cols-2 gap-4">
      <!-- Input -->
      <div class="demo-card">
        <div class="demo-card-label">Color Input</div>
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <label
              class="w-12 h-12 rounded-xl cursor-pointer border border-line flex-shrink-0 overflow-hidden"
              :style="{ background: isValid ? colorInput : '#e2e8f0' }"
            >
              <input
                v-model="colorInput"
                type="color"
                class="opacity-0 w-full h-full cursor-pointer"
              />
            </label>
            <div class="flex-1">
              <input
                v-model="colorInput"
                type="text"
                placeholder="#6366f1 or rgb(…) or hsl(…)"
                class="w-full bg-panel border border-line rounded-lg px-3 py-2 text-sm text-ink placeholder:text-dim outline-none focus:border-brand transition-colors"
              />
            </div>
          </div>

          <!-- Validity badge -->
          <div class="flex items-center gap-2">
            <span
              class="text-xs px-2.5 py-1 rounded-full font-medium"
              :class="isValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'"
            >
              {{ isValid ? 'Valid color' : 'Invalid color' }}
            </span>
            <span
              v-if="isValid"
              class="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 text-slate-600"
            >
              {{ isDark ? 'isDarkColor' : isLight ? 'isLightColor' : '' }}
            </span>
          </div>

          <!-- Swatches -->
          <div>
            <div class="text-xs text-dim mb-2">Presets</div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="c in swatchPresets"
                :key="c"
                class="w-7 h-7 rounded-md border-2 transition-all cursor-pointer"
                :style="{ background: c }"
                :class="colorInput === c ? 'border-slate-400 scale-110' : 'border-transparent'"
                @click="colorInput = c"
              ></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Conversions -->
      <div class="demo-card">
        <div class="demo-card-label">Conversions</div>
        <div class="space-y-4">
          <div
            v-if="isValid"
            class="w-full h-16 rounded-xl border border-line"
            :style="{ background: colorInput }"
          ></div>
          <div v-else class="w-full h-16 rounded-xl border border-line bg-surface flex items-center justify-center text-dim text-xs">
            Enter a valid color
          </div>

          <div class="space-y-3">
            <div class="flex items-start justify-between gap-3">
              <span class="text-xs text-dim flex-shrink-0 pt-0.5">convertToHsl</span>
              <span class="code-val text-right break-all">{{ hsl }}</span>
            </div>
            <div class="flex items-start justify-between gap-3">
              <span class="text-xs text-dim flex-shrink-0 pt-0.5">convertToHslCssVar</span>
              <span class="code-val text-right break-all">{{ hslVar }}</span>
            </div>
            <div class="flex items-start justify-between gap-3">
              <span class="text-xs text-dim flex-shrink-0 pt-0.5">convertToRgb</span>
              <span class="code-val text-right break-all">{{ rgb }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
