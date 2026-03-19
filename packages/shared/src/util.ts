/**
 * 获取嵌套对象的字段值
 * @param obj - 要查找的对象
 * @param path - 用于查找字段的路径，使用小数点分隔
 * @returns 字段值，或者未找到时返回 undefined
 */
export function getNestedValue<T>(obj: T, path: string): any {
  if (typeof path !== 'string' || path.length === 0) {
    throw new Error('Path must be a non-empty string')
  }
  // 把路径字符串按 "." 分割成数组
  const keys = path.split('.') as (number | string)[]

  let current: any = obj

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined
    }
    current = current[key as keyof typeof current]
  }

  return current
}

/**
 * sleep 函数，暂停执行指定的毫秒数
 */
export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
