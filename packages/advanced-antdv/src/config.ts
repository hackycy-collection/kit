import { isObject } from '@hackycy-toolkit/shared/es-toolkit'

interface TableConfig {
  fetchSetting: unknown
}

export interface AdvancedAntdvGlobalConfig {
  table: TableConfig
}

const globalConfig: Partial<AdvancedAntdvGlobalConfig> = {}

function setGlobalConfig(config: Partial<AdvancedAntdvGlobalConfig>) {
  if (!config || !isObject(config)) {
    return
  }

  Object.assign(globalConfig, config)
}

function getGlobalConfig() {
  return globalConfig
}

export { getGlobalConfig, setGlobalConfig }
