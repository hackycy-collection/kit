export interface FetchParams {
  page?: number
  [key: string]: any
}

export interface FetchSetting {
  // 请求接口当前页数
  pageField: string
  // 每页显示多少条
  sizeField: string
  // 请求结果列表字段  支持 a.b.c
  listField: string
  // 请求结果总数字段  支持 a.b.c
  totalField: string
}
