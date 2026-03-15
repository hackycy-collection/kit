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
 * Determines whether the specified URL is absolute
 */
export function isAbsoluteURL(url: string): boolean {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  // eslint-disable-next-line e18e/prefer-static-regex, regexp/no-unused-capturing-group
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url)
}

/**
 * Creates a new URL by combining the specified URLs
 */
export function combineURLs(baseURL: string, relativeURL: string) {
  // eslint-disable-next-line prefer-template, e18e/prefer-static-regex
  return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL
}

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 */
export function buildFullPath(baseURL: string, requestedURL: string) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL)
  }
  return requestedURL
}

/**
 * sleep 函数，暂停执行指定的毫秒数
 */
export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
