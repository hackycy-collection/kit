import type { AdvancedAntdvGlobalConfig } from './types'

import { defineGlobalConfig } from '@hackycy-toolkit/shared'

export const { getGlobalConfig, setGlobalConfig }
  = defineGlobalConfig<AdvancedAntdvGlobalConfig>()

export type { AdvancedAntdvGlobalConfig }
