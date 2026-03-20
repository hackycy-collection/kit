interface CurrencyFormatOptions {
  /** 小数位数，默认 2 */
  decimalPlaces?: number
  /** 货币符号（前缀），如 ¥、$ */
  currencySymbol?: string
  /** 货币单位（后缀），如 元、USD */
  currencyUnit?: string
  /** 是否显示千分位分隔符，默认 true */
  useGrouping?: boolean
  /** 负数显示格式 */
  negativeFormat?: 'parentheses' | 'minus' // (100) 或 -100
}

/**
 * 格式化货币金额
 * 支持千分位分隔符、自定义小数位、货币符号等
 *
 * @example
 * formatCurrency(1234567.89) // "1,234,567.89"
 * formatCurrency(1234567.89, { currencySymbol: '¥' }) // "¥1,234,567.89"
 * formatCurrency(-1234.5, { negativeFormat: 'parentheses' }) // "(1,234.50)"
 */
export function formatCurrency(
  amount: string | number | null | undefined,
  options: CurrencyFormatOptions = {},
): string {
  const {
    decimalPlaces = 2,
    currencySymbol = '',
    currencyUnit = '',
    useGrouping = true,
    negativeFormat = 'minus',
  } = options

  // 处理 null、undefined、空字符串
  if (amount === null || amount === undefined || amount === '') {
    return `${currencySymbol}${formatZero(decimalPlaces, useGrouping)}${currencyUnit}`
  }

  const num = typeof amount === 'string' ? Number.parseFloat(amount) : amount

  // 处理 NaN、无穷大
  if (!Number.isFinite(num)) {
    return `${currencySymbol}${formatZero(decimalPlaces, useGrouping)}${currencyUnit}`
  }

  const isNegative = num < 0
  const absoluteNum = Math.abs(num)

  // 使用 toLocaleString 实现千分位和更精确的格式化
  const formattedNumber = absoluteNum.toLocaleString('zh-CN', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    useGrouping,
  })

  // 处理负数格式
  const result = isNegative && negativeFormat === 'parentheses'
    ? `(${formattedNumber})`
    : `${isNegative ? '-' : ''}${formattedNumber}`

  return `${currencySymbol}${result}${currencyUnit}`
}

/** 格式化零值 */
function formatZero(decimalPlaces: number, useGrouping: boolean): string {
  const zero = (0).toLocaleString('zh-CN', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    useGrouping,
  })
  return zero
}

// 预设快捷函数
export function formatCNY(amount: string | number | null | undefined, options?: Omit<CurrencyFormatOptions, 'currencySymbol' | 'currencyUnit'>) {
  return formatCurrency(amount, { ...options, currencySymbol: '¥', currencyUnit: '' })
}

export function formatUSD(amount: string | number | null | undefined, options?: Omit<CurrencyFormatOptions, 'currencySymbol' | 'currencyUnit'>) {
  return formatCurrency(amount, { ...options, currencySymbol: '$', currencyUnit: '' })
}
