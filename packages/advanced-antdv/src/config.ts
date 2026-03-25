import type { AdvancedAntdvGlobalConfig } from './types'

import { defineGlobalConfig } from '@hackycy-kit/shared'

export const DEFAULT_GLOBAL_CONFIG: AdvancedAntdvGlobalConfig = {
  table: {
    fetchSetting: {
      // 传给后台的当前页字段
      pageField: 'pageNo',
      // 传给后台的每页显示多少条的字段
      sizeField: 'pageSize',
      // 接口返回表格数据的字段
      listField: 'records',
      // 接口返回表格总数的字段
      totalField: 'total',
    },
    pageSize: 10,
    pageSizeOptions: ['10', '20', '50', '100'],
    showTotal: total => `共 ${total} 条`,
  },
}

export const { getGlobalConfig, setGlobalConfig }
  = defineGlobalConfig<AdvancedAntdvGlobalConfig>()

export type { AdvancedAntdvGlobalConfig }
