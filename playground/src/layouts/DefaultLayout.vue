<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { navConfig } from '@/router'

const route = useRoute()
const pageTitle = computed(() => (route.meta as Record<string, string>).title ?? '')
const pageCategory = computed(() => (route.meta as Record<string, string>).category ?? '')
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-canvas">
    <!-- ── Sidebar ── -->
    <aside class="flex flex-col w-56 flex-shrink-0 border-r border-line bg-panel">
      <!-- Logo -->
      <div class="flex items-center gap-3 px-5 py-4 border-b border-line">
        <div class="leading-tight">
          <div class="text-sm font-semibold text-ink">toolkit</div>
          <div class="text-xs text-dim">playground</div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto px-3 py-4">
        <div v-for="cat in navConfig" :key="cat.key" class="mb-5">
          <div class="flex items-center gap-1.5 px-2 mb-1.5">
            <span
              class="w-1.5 h-1.5 rounded-full flex-shrink-0"
              :style="{ background: cat.accent }"
            ></span>
            <span class="text-[10px] font-semibold tracking-widest uppercase text-dim">
              {{ cat.label }}
            </span>
          </div>

          <RouterLink
            v-for="item in cat.items"
            :key="item.path"
            :to="item.path"
            :class="[
              'flex items-center px-3 py-1.5 rounded-md text-[13px] transition-colors duration-100 mb-0.5 no-underline',
              route.path === item.path
                ? 'bg-lifted text-brand-light font-medium'
                : 'text-soft hover:text-ink hover:bg-surface',
            ]"
          >
            {{ item.name }}
          </RouterLink>
        </div>
      </nav>

      <!-- Footer -->
      <div class="px-5 py-3 border-t border-line">
        <span class="text-xs text-dim">@hackycy</span>
      </div>
    </aside>

    <!-- ── Main ── -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="flex-shrink-0 flex items-center gap-2.5 px-7 py-4 border-b border-line bg-canvas">
        <h1 class="text-sm font-semibold text-ink !m-0 !p-0">{{ pageTitle }}</h1>
        <span class="text-[11px] px-2 py-0.5 rounded font-medium bg-lifted text-brand-light">
          {{ pageCategory }}
        </span>
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-auto p-7 bg-canvas">
        <RouterView />
      </main>
    </div>
  </div>
</template>
