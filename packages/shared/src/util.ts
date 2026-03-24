import { merge } from 'lodash-es'

/**
 * 将类的方法绑定到实例上，确保在调用时 `this` 始终指向实例
 * @param instance - 要绑定方法的类实例
 */
export function bindMethods<T extends object>(instance: T): void {
  const prototype = Object.getPrototypeOf(instance)
  const propertyNames = Object.getOwnPropertyNames(prototype)

  propertyNames.forEach((propertyName) => {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, propertyName)
    const propertyValue = instance[propertyName as keyof T]

    if (
      typeof propertyValue === 'function'
      && propertyName !== 'constructor'
      && descriptor
      && !descriptor.get
      && !descriptor.set
    ) {
      instance[propertyName as keyof T] = propertyValue.bind(instance)
    }
  })
}

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

/**
 * 定义全局配置的函数，返回获取和设置全局配置的方法
 */
export function defineGlobalConfig<T extends object>() {
  const config = {} as T
  return {
    getGlobalConfig: (): Readonly<T> => config,
    setGlobalConfig: (cfg: T) => { merge(config, cfg) },
  }
}
