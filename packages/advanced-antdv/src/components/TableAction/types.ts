export interface TableActionItem {
  key?: number | string
  label: string
  disabled?: boolean
  danger?: boolean
  onClick?: () => Promise<any> | any
}
