<script setup lang="ts">
import { computed, ref } from 'vue'
import { filterTree, mapTree, traverseTreeValues } from '@hackycy-kit/shared'

interface OrgNode {
  id: number
  name: string
  children?: OrgNode[]
}

const treeData: OrgNode[] = [
  {
    id: 1,
    name: 'Engineering',
    children: [
      {
        id: 2,
        name: 'Frontend',
        children: [
          { id: 5, name: 'React Team' },
          { id: 6, name: 'Vue Team' },
        ],
      },
      {
        id: 3,
        name: 'Backend',
        children: [
          { id: 7, name: 'Node.js Team' },
          { id: 8, name: 'Go Team' },
        ],
      },
      { id: 4, name: 'DevOps' },
    ],
  },
  {
    id: 9,
    name: 'Design',
    children: [
      { id: 10, name: 'UX Team' },
      { id: 11, name: 'Brand Team' },
    ],
  },
  {
    id: 12,
    name: 'Product',
    children: [
      { id: 13, name: 'Mobile' },
      { id: 14, name: 'Web' },
    ],
  },
]

const filterQuery = ref('')
const showTraversed = ref(false)

const filteredTree = computed<OrgNode[]>(() => {
  if (!filterQuery.value.trim()) return treeData
  return filterTree(treeData, (node: OrgNode) =>
    node.name.toLowerCase().includes(filterQuery.value.toLowerCase()),
  )
})

const allNames = computed(() =>
  traverseTreeValues(treeData, (node: OrgNode) => node.name),
)

const mappedTree = computed(() =>
  mapTree(treeData, (node: OrgNode) => ({ ...node, label: `[${node.id}] ${node.name}` })),
)

type MappedNode = OrgNode & { label: string }

function getMappedLabel(node: MappedNode): string {
  return node.label
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-soft text-sm m-0">
      Tree utilities from <code class="code-val">@hackycy-kit/shared</code>:
      <code class="code-val">filterTree</code>, <code class="code-val">mapTree</code>,
      and <code class="code-val">traverseTreeValues</code>.
    </p>

    <div class="grid grid-cols-2 gap-4">
      <!-- Source + Filter -->
      <div class="demo-card">
        <div class="demo-card-label">filterTree</div>
        <div class="space-y-3">
          <input
            v-model="filterQuery"
            type="text"
            placeholder="Filter by name…"
            class="w-full bg-panel border border-line rounded-lg px-3 py-2 text-sm text-ink placeholder:text-dim outline-none focus:border-brand transition-colors"
          />

          <div class="text-xs text-dim">
            {{ filterQuery ? `Showing matches for "${filterQuery}"` : 'All nodes (no filter)' }}
          </div>

          <!-- Tree render -->
          <div class="rounded-lg overflow-hidden bg-panel border border-line">
            <template v-if="filteredTree.length > 0">
              <div
                v-for="root in filteredTree"
                :key="root.id"
                class="border-b border-line last:border-0"
              >
                <div class="flex items-center gap-2 px-3 py-2">
                  <span class="text-brand-light font-medium text-sm">{{ root.name }}</span>
                  <span class="text-xs text-dim">#{{ root.id }}</span>
                </div>
                <div v-if="root.children?.length" class="ml-4">
                  <div
                    v-for="child in root.children"
                    :key="child.id"
                    class="border-b border-line last:border-0"
                  >
                    <div class="flex items-center gap-2 px-3 py-1.5">
                      <span class="text-soft text-sm">{{ child.name }}</span>
                      <span class="text-xs text-dim">#{{ child.id }}</span>
                    </div>
                    <div v-if="child.children?.length" class="ml-4">
                      <div
                        v-for="leaf in child.children"
                        :key="leaf.id"
                        class="flex items-center gap-2 px-3 py-1"
                      >
                        <span class="text-dim text-xs">└</span>
                        <span class="text-soft text-xs">{{ leaf.name }}</span>
                        <span class="text-xs text-dim">#{{ leaf.id }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="px-3 py-4 text-center text-dim text-xs">
              No matches found
            </div>
          </div>
        </div>
      </div>

      <!-- Traverse + Map -->
      <div class="space-y-4">
        <!-- traverseTreeValues -->
        <div class="demo-card">
          <div class="flex items-center justify-between mb-3">
            <div class="demo-card-label mb-0">traverseTreeValues</div>
            <button
              class="text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-line"
              :class="showTraversed ? 'bg-lifted text-brand-light' : 'bg-panel text-soft hover:text-ink'"
              @click="showTraversed = !showTraversed"
            >
              {{ showTraversed ? 'Hide' : 'Show all' }}
            </button>
          </div>
          <p class="text-xs text-dim m-0 mb-3">Returns every node's <code class="code-val">name</code> via DFS.</p>
          <div v-if="showTraversed" class="flex flex-wrap gap-1.5">
            <span
              v-for="name in allNames"
              :key="name"
              class="text-xs px-2 py-0.5 rounded bg-lifted text-brand-light"
            >{{ name }}</span>
          </div>
          <div v-else class="text-xs text-dim">
            <span class="code-val">{{ allNames.length }}</span> nodes collected
          </div>
        </div>

        <!-- mapTree -->
        <div class="demo-card">
          <div class="demo-card-label">mapTree</div>
          <p class="text-xs text-dim m-0 mb-3">Transforms each node — adds a <code class="code-val">label</code> field.</p>
          <div class="space-y-1">
            <div
              v-for="root in (mappedTree as MappedNode[])"
              :key="root.id"
              class="text-xs"
            >
              <div class="text-soft">{{ getMappedLabel(root) }}</div>
              <div v-for="child in (root.children as MappedNode[])" :key="child.id" class="ml-3 text-dim">
                ↳ {{ getMappedLabel(child) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
