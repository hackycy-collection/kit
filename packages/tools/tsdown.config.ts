import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/cache/index.ts',
    'src/hooks/index.ts',
    'src/request/index.ts',
  ],
  dts: true,
  exports: true,
  publint: true,
})
