/**
 * 高精度数学运算库 (基于 big.js 实现)
 * 解决 JavaScript 浮点数精度问题
 */
import Big from 'big.js'

let _isRangeValidationEnabled = true

/**
 * 修正浮点数精度误差
 * @example normalizePrecision(0.09999999999999998) // 0.1
 */
function normalizePrecision(num: number, precision = 15): number {
  return +Number.parseFloat(Number(num).toPrecision(precision))
}

/**
 * 获取数字的小数位数
 */
function getDecimalPlaces(num: number): number {
  // eslint-disable-next-line e18e/prefer-static-regex
  const eSplit = num.toString().split(/e/i)
  const len = (eSplit[0]!.split('.')[1] || '').length - +(eSplit[1] || 0)
  return Math.max(len, 0)
}

/**
 * 将浮点数放大为整数（消除小数部分）
 */
function scaleToInteger(num: number): number {
  if (!num.toString().includes('e')) {
    return Number(num.toString().replace('.', ''))
  }
  const decimalPlaces = getDecimalPlaces(num)
  return decimalPlaces > 0
    ? normalizePrecision(Number(num) * 10 ** decimalPlaces)
    : Number(num)
}

/**
 * 验证数字是否在安全整数范围内
 */
function assertSafeIntegerRange(num: number): void {
  if (
    _isRangeValidationEnabled
    && (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER)
  ) {
    console.warn(`${num} 超出了精度限制，结果可能不正确`)
  }
}

/**
 * 对数字数组进行归约计算
 */
function reduceNumbers(
  numbers: number[],
  operation: (a: number, b: number) => number,
): number {
  const [first, second, ...rest] = numbers
  let result = operation(first!, second!)
  rest.forEach((num) => {
    result = operation(result, num)
  })
  return result
}

/**
 * 将数字转换为 Big 对象
 */
function toBig(num: number): Big {
  return new Big(num)
}

/**
 * 高精度乘法
 * @param factors - 乘数列表
 * @returns 乘积
 * @example precisionMultiply(0.1, 0.2) // 0.02
 * @example precisionMultiply(0.1, 0.2, 0.3) // 0.006
 */
export function precisionMultiply(...factors: number[]): number {
  if (factors.length === 0)
    return 0
  if (factors.length === 1)
    return factors[0]!
  if (factors.length > 2) {
    return reduceNumbers(factors, precisionMultiply)
  }
  const [multiplicand, multiplier] = factors
  const result = toBig(multiplicand!).times(toBig(multiplier!))

  return result.toNumber()
}

/**
 * 高精度加法
 * @param addends - 加数列表
 * @returns 和
 * @example precisionAdd(0.1, 0.2) // 0.3
 * @example precisionAdd(0.1, 0.2, 0.3) // 0.6
 */
export function precisionAdd(...addends: number[]): number {
  if (addends.length === 0)
    return 0
  if (addends.length === 1)
    return addends[0]!
  if (addends.length > 2) {
    return reduceNumbers(addends, precisionAdd)
  }
  const [augend, addend] = addends
  const result = toBig(augend!).plus(toBig(addend!))

  return result.toNumber()
}

/**
 * 高精度减法
 * @param numbers - 数字列表（第一个为被减数，其余为减数）
 * @returns 差
 * @example precisionSubtract(0.3, 0.1) // 0.2
 * @example precisionSubtract(1, 0.1, 0.2) // 0.7
 */
export function precisionSubtract(...numbers: number[]): number {
  if (numbers.length === 0)
    return 0
  if (numbers.length === 1)
    return numbers[0]!
  if (numbers.length > 2) {
    return reduceNumbers(numbers, precisionSubtract)
  }
  const [minuend, subtrahend] = numbers
  const result = toBig(minuend!).minus(toBig(subtrahend!))

  return result.toNumber()
}

/**
 * 高精度除法
 * @param numbers - 数字列表（第一个为被除数，其余为除数）
 * @returns 商
 * @example precisionDivide(0.3, 0.1) // 3
 * @example precisionDivide(1, 0.1, 0.2) // 50
 */
export function precisionDivide(...numbers: number[]): number {
  if (numbers.length === 0)
    return 0
  if (numbers.length === 1)
    return numbers[0]!
  if (numbers.length > 2) {
    return reduceNumbers(numbers, precisionDivide)
  }
  const [dividend, divisor] = numbers

  // 检查除数为零
  if (toBig(divisor!).eq(0)) {
    throw new Error('Division by zero')
  }

  const result = toBig(dividend!).div(toBig(divisor!))

  return result.toNumber()
}

/**
 * 高精度四舍五入
 * @param num - 要舍入的数字
 * @param decimalPlaces - 小数位数（默认2位）
 * @returns 舍入后的结果
 * @example roundToPrecision(0.555, 2) // 0.56
 * @example roundToPrecision(1.005, 2) // 1.01
 */
export function roundToPrecision(num: number, decimalPlaces: number = 2): number {
  const result = toBig(num).round(decimalPlaces).toNumber()
  return result
}

/**
 * 设置是否启用安全整数范围检查
 * @param enabled - true 为开启（默认），false 为关闭
 */
export function setSafeIntegerCheck(enabled = true): void {
  _isRangeValidationEnabled = enabled
}

/**
 * 获取当前安全整数检查状态
 * @returns 当前状态
 */
export function getSafeIntegerCheckState(): boolean {
  return _isRangeValidationEnabled
}

/**
 * 重置安全整数检查状态为默认（开启）
 */
export function resetSafeIntegerCheck(): void {
  _isRangeValidationEnabled = true
}

// 导出内部工具函数
export {
  assertSafeIntegerRange,
  getDecimalPlaces,
  normalizePrecision,
  reduceNumbers,
  scaleToInteger,
}
