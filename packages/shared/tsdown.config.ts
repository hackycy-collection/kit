import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/hooks.ts',
    'src/lodash.ts',
  ],
  dts: true,
  exports: true,
  publint: true,
})
