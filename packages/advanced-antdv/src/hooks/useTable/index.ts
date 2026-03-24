import type {
  PaginationProps,
  TableColumnType,
  TableProps,
} from 'ant-design-vue'

import type { ComputedRef, Ref } from 'vue'
import type { FetchParams, FetchSetting } from '../../types'

import { cloneDeep, get, isFunction, merge } from '@hackycy-kit/shared'

import { useEventListener } from '@vueuse/core'

import { Table } from 'ant-design-vue'
import {
  computed,
  defineComponent,
  h,
  nextTick,
  reactive,
  ref,
  toRaw,
  unref,
  watch,
  watchEffect,
} from 'vue'

import { getGlobalConfig } from '../../config'

import './use-antdv-table.scss'

export const DEFAULT_PAGE_SIZE = 10
export const DEFAULT_PAGE_SIZE_OPTIONS = ['10', '20', '50', '100']

export const DEFAULT_FETCH_SETTING: FetchSetting = {
  // 传给后台的当前页字段
  pageField: 'pageNo',
  // 传给后台的每页显示多少条的字段
  sizeField: 'pageSize',
  // 接口返回表格数据的字段
  listField: 'records',
  // 接口返回表格总数的字段
  totalField: 'total',
}

export interface TableAction {
  setProps: (props: Partial<ExtendTableProps & TableProps<any>>) => void
  setDataSource: (dataSource: any[]) => void
  getDataSource: () => any[]
  clearSelectedRowKeys: () => void
  setShowPagination: (flag: boolean) => void
  setPagination: (pagination: PaginationProps) => void
  setLoading: (loading: boolean) => void
  reload: (opt?: FetchParams) => Promise<void>
}

export interface ExtendTableProps {
  /**
   * 数据请求函数，接收任意参数，返回数据或 Promise 对象
   */
  api?: (...arg: any[]) => any | Promise<any>

  /**
   * 请求前的参数处理函数，接收当前请求参数，返回新的请求参数或 Promise 对象
   */
  beforeFetch?: (params: FetchParams) => FetchParams | Promise<FetchParams>

  /**
   * 请求后的数据处理函数，返回最终用于表格展示的数据或 Promise 对象
   */
  afterFetch?: (data: any) => any | Promise<any>

  /**
   * 默认的 fetchSetting 配置，适用于大多数后端接口
   * 如有需要可通过 ExtendTableProps.fetchSetting 或者 全局变量 __USE_ANTDV_TABLE_FETCH_SETTING__ 进行覆盖
   */
  fetchSetting?: FetchSetting

  /**
   * 是否立即执行数据请求，默认为 true
   */
  immediate?: boolean

  /**
   * 是否展示序号列
   */
  showIndexColumn?: boolean

  /**
   * 序号列配置项，默认为 { width: 50, align: 'center' }，可通过 indexColumnProps 进行覆盖
   */
  indexColumnProps?: TableColumnType

  /**
   * 在分页改变的时候清空选项
   */
  clearSelectOnPageChange?: boolean

  /**
   * 合计行配置
   */
  summary?:
    | false
    | {
      appendColumns?: TableColumnType[]
      overwriteColumns?: Record<string, TableColumnType>
      prefixColumns?: TableColumnType[]
      resetColumns?: string[]
      summaryFunc?: (data: any[]) => any[]
    }
}

/**
 * 便捷使用 Ant Design Vue 的 Table 组件，提供默认配置和行选择功能。
 */
export function useTable<T = any>(
  tableProps?: ExtendTableProps & TableProps<T>,
) {
  const dataSourceRef = ref<T[]>(tableProps?.dataSource ?? [])

  // 内部维护，用于存储用户通过 setProps 设置的属性
  const innerPropsRef = ref<ExtendTableProps & TableProps<T>>()

  const innerPaginationPropsRef = ref<PaginationProps>({})
  const showPaginationRef = ref(true)

  const defaultTableProps: ExtendTableProps & TableProps<T> = merge(
    {
      rowKey: 'id',
      bordered: false,
      size: 'small',
      immediate: true,
    },
    // 合并用户个性化配置
    tableProps,
  )

  const rowSelection: TableProps<T>['rowSelection'] = tableProps?.rowSelection ?? {}

  // 当前选择的行
  const selectedRowKeys = ref<(string | number)[]>([])
  // 选择的行记录
  const selectedRows = ref<T[]>([])

  const defaultRowSelection = reactive<any>({
    ...rowSelection,
    type: rowSelection.type ?? 'checkbox',
    // 选择列宽度，默认 50
    columnWidth: rowSelection.columnWidth ?? 50,
    selectedRowKeys: selectedRowKeys as unknown as (string | number)[][],
    onChange(...args: any[]) {
      selectedRowKeys.value = args[0]
      selectedRows.value = args[1]
      if (typeof rowSelection.onChange === 'function') {
        // eslint-disable-next-line ts/ban-ts-comment
        // @ts-ignore
        rowSelection.onChange(...args)
      }
    },
  })

  // 删除 rowSelection 属性，避免与默认的 rowSelection 冲突
  delete defaultTableProps.rowSelection

  const getProps = computed(() => {
    return {
      ...defaultTableProps,
      ...unref(innerPropsRef),
    }
  })

  const getPaginationProps = computed((): false | PaginationProps => {
    const pagination = unref(getProps).pagination

    if (
      !unref(showPaginationRef)
      || (typeof pagination === 'boolean' && !pagination)
    ) {
      return false
    }

    const tableGlobalConfig = getGlobalConfig().table
    const pageSize = tableGlobalConfig?.pageSize ?? DEFAULT_PAGE_SIZE
    const pageSizeOptions = tableGlobalConfig?.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS
    const showTotal = tableGlobalConfig?.showTotal ?? (total => `共 ${total} 条`)

    return {
      current: 1,
      pageSize,
      size: 'small',
      defaultPageSize: pageSize,
      pageSizeOptions,
      showSizeChanger: true,
      responsive: true,
      showTotal,
      ...pagination,
      ...unref(innerPaginationPropsRef),
    }
  })

  // 监听 pagination 属性变化，更新内部的 pagination 配置
  watch(
    () => unref(getProps).pagination,
    (pagination) => {
      if (typeof pagination !== 'boolean' && pagination) {
        innerPaginationPropsRef.value = {
          ...unref(innerPaginationPropsRef),
          ...pagination,
        }
      }
    },
  )

  watch(
    () => unref(getProps).dataSource,
    () => {
      const { dataSource, api } = unref(getProps)
      !api && dataSource && (dataSourceRef.value = dataSource)
    },
    {
      immediate: true,
    },
  )

  // api 请求状态
  const loading = ref(false)
  const getLoading = computed(() => loading.value)

  const getColumns = computed(() => {
    const columns: TableColumnType[] = cloneDeep(unref(getProps).columns ?? [])

    if (unref(getProps).showIndexColumn) {
      const isFixedLeft = columns.some(col => col.fixed === 'left')
      columns.unshift({
        width: 50,
        title: '#',
        align: 'center',
        customRender: ({ index }) => {
          const pagination = unref(getPaginationProps)
          if (typeof pagination === 'boolean' || !pagination) {
            return index + 1
          }
          else {
            const pageSize = getGlobalConfig().table?.pageSize ?? DEFAULT_PAGE_SIZE
            const { current = 1, pageSize: paginationPageSize = pageSize } = pagination
            return (Math.max(current, 1) - 1) * paginationPageSize + index + 1
          }
        },
        ...(isFixedLeft ? { fixed: 'left' } : {}),
        ...unref(getProps).indexColumnProps,
      })
    }

    return columns
  })

  const getFooterProps = computed(() => {
    if (!getProps.value.summary) {
      return getProps.value.footer
    }

    const KEY = '_summary_row_key'
    const {
      summaryFunc,
      overwriteColumns,
      prefixColumns,
      appendColumns,
      resetColumns,
    } = getProps.value.summary

    const tableColumns: TableColumnType[] = (
      cloneDeep(unref(getColumns)) ?? []
    ).map((col: TableColumnType) => {
      delete col.customHeaderCell

      if (
        overwriteColumns
        && col.dataIndex
        && overwriteColumns[col.dataIndex as string]
      ) {
        return {
          ...col,
          ...overwriteColumns[col.dataIndex as string],
        }
      }
      else if (
        (resetColumns
          && col.dataIndex
          && resetColumns.includes(col.dataIndex as string))
        || !col.dataIndex
      ) {
        delete col.customRender
        delete col.customCell
        return col
      }

      return col
    })

    // 避免拥有选择列等导致列偏移，需要手动添加前缀或后缀列占位
    if (prefixColumns?.length) {
      tableColumns.unshift(...prefixColumns)
    }
    if (appendColumns?.length) {
      tableColumns.push(...appendColumns)
    }

    let _datasource: any[] = []
    if (isFunction(summaryFunc)) {
      _datasource = summaryFunc(dataSourceRef.value) ?? []
      _datasource.forEach((item, index) => {
        item[KEY] = `${index}`
      })
    }

    // 没有数据时不渲染表尾，避免出现空白行
    if (_datasource.length <= 0) {
      return null
    }

    return () =>
      h(Table, {
        bordered: getProps.value.bordered,
        pagination: false,
        tableLayout: 'fixed',
        scroll: getProps.value.scroll,
        columns: tableColumns,
        showHeader: false,
        dataSource: _datasource,
        rowKey: r => r[KEY],
      })
  })

  const getScoll = computed((): TableProps<T>['scroll'] => {
    const scroll = unref(getProps).scroll

    return {
      ...scroll,
    }
  })

  // 计算最终绑定到 Table 组件的属性 (不包含 rowSelection)
  const getBindingProps = computed(() => {
    const customClass = (getProps.value as any)?.class
    const tableClass = getProps.value.summary
      ? ['use-antdv-table--summary', customClass]
      : customClass

    const tableProps = unref(getProps) as TableProps<T>

    return {
      ...tableProps,
      dataSource: unref(dataSourceRef) as T[],
      footer: unref(getFooterProps) as any,
      pagination: toRaw(unref(getPaginationProps)),
      columns: unref(getColumns),
      scroll: unref(getScoll),
      class: tableClass,
      onChange: (...args: any[]) => {
        // eslint-disable-next-line no-useless-call
        (handleTableChange as (...args: any[]) => void).call(
          undefined,
          ...args,
        )

        // 透传
        const { onChange } = unref(getProps)

        if (isFunction(onChange)) {
          // eslint-disable-next-line no-useless-call
          (onChange as (...args: any[]) => void).call(undefined, ...args)
        }
      },
      // 在组件挂载后立即执行一次数据请求（如果配置了 api 和 immediate）
      // for @vue:mounted
      onVnodeMounted: () => {
        setTimeout(() => {
          unref(getProps).immediate && fetch()
        }, 16)
      },
    }
  })

  const tableAction: TableAction = {
    setProps: (props: Partial<TableProps<T>>) => {
      innerPropsRef.value = {
        ...innerPropsRef.value,
        ...props,
      }
    },
    setDataSource: (newDataSource: any[]) => {
      dataSourceRef.value = newDataSource
    },
    getDataSource: () => {
      return dataSourceRef.value
    },
    clearSelectedRowKeys: () => {
      selectedRowKeys.value = []
      selectedRows.value = []
    },
    setShowPagination: (flag: boolean) => {
      showPaginationRef.value = flag
    },
    setPagination: (pagination: Partial<PaginationProps>) => {
      innerPaginationPropsRef.value = {
        ...innerPaginationPropsRef.value,
        ...pagination,
      }
    },
    setLoading: (flag: boolean) => {
      loading.value = flag
    },
    reload: async (opt?: FetchParams) => {
      await fetch(opt)
    },
  }

  /**
   * 自定义 Table 组件，用于处理 Summary Table 的联动滚动等特殊需求
   * 如需联动滚动功能，必须使用此组件作为 Table 的渲染组件
   */
  const UseAntdvTable = defineComponent({
    name: 'UseAntdvTable',
    setup(props, { attrs, slots }) {
      const tableRef = ref<null | { $el: HTMLElement }>(null)

      watchEffect(() => {
        // 监听Table滚动让Summary Table进行联动滚动
        handleSummaryScroll()
      })

      function handleSummaryScroll() {
        const { summary } = unref(getProps)
        if (!summary) {
          return
        }

        nextTick(() => {
          const tableEl = tableRef.value?.$el as unknown as HTMLElement
          if (!tableEl) {
            return
          }

          const bodyDom = tableEl.querySelector('.ant-table-body')
          if (!bodyDom) {
            return
          }

          setTimeout(() => {
            useEventListener(bodyDom, 'scroll', () => {
              const footerBodyDom = tableEl.querySelector(
                '.ant-table-footer .ant-table-body',
              ) as HTMLDivElement

              if (!footerBodyDom || !bodyDom)
                return
              footerBodyDom.scrollLeft = bodyDom.scrollLeft
            })
          }, 0)
        })
      }

      return () =>
        h(
          Table,
          {
            ...props,
            ...attrs,
            ref: tableRef,
            loading: unref(getLoading),
          },
          slots,
        )
    },
  })

  async function fetch(opt?: FetchParams) {
    const { api, beforeFetch, fetchSetting, afterFetch } = unref(getProps)

    if (!api || !isFunction(api)) {
      return
    }

    const { pageField, sizeField, listField, totalField } = {
      ...DEFAULT_FETCH_SETTING,
      ...getGlobalConfig().table?.fetchSetting,
      ...fetchSetting,
    }

    try {
      const pagination = unref(getPaginationProps)
      const pageParams: Record<string, any> = {}

      if (typeof pagination !== 'boolean' && pagination) {
        const pageSize = getGlobalConfig().table?.pageSize ?? DEFAULT_PAGE_SIZE
        const { current = 1, pageSize: paginationPageSize = pageSize } = pagination
        pageParams[pageField] = (opt && opt.page) || current
        pageParams[sizeField] = paginationPageSize
      }

      tableAction.setLoading(true)

      let params: Record<string, any> = {
        ...opt,
        ...pageParams,
      }

      if (beforeFetch && isFunction(beforeFetch)) {
        params = (await beforeFetch(params)) || params
      }

      const res = await api(params)
      const isArrayResult = Array.isArray(res)

      let resultItems: any[] = isArrayResult ? res : get(res, listField)
      const resultTotal: number = isArrayResult ? 0 : get(res, totalField)

      if (afterFetch && isFunction(afterFetch)) {
        resultItems = (await afterFetch(resultItems)) || resultItems
      }

      dataSourceRef.value = resultItems
      tableAction.setPagination({
        total: Number(resultTotal) || 0,
      })

      if (opt && opt.page) {
        tableAction.setPagination({
          current: opt.page || 1,
        })
      }

      return resultItems
    }
    catch {
      dataSourceRef.value = []
      tableAction.setPagination({
        total: 0,
      })
    }
    finally {
      tableAction.setLoading(false)
    }
  }

  function handleTableChange(
    pagination: PaginationProps,
    _filters: unknown,
    _sorter: unknown,
  ) {
    const { clearSelectOnPageChange } = unref(getProps)

    if (clearSelectOnPageChange) {
      tableAction.clearSelectedRowKeys()
    }

    tableAction.setPagination(pagination)

    fetch()
  }

  return [
    getBindingProps,
    tableAction,
    {
      loading: getLoading,
      selectedRows,
      selectedRowKeys,
      rowSelection: defaultRowSelection,
    },
    UseAntdvTable,
  ] as [
    ComputedRef<TableProps<T>>,
    TableAction,
    {
      loading: ComputedRef<boolean>
      rowSelection: Record<string, any>
      selectedRowKeys: Ref<(string | number)[]>
      selectedRows: Ref<T[]>
    },
    typeof UseAntdvTable,
  ]
}
