import { describe, expect, it } from 'vitest'
import { formatCNY, formatCurrency, formatUSD } from './currency-formatter'

describe('formatCurrency', () => {
  describe('基础格式化', () => {
    it('应该正确格式化整数', () => {
      expect(formatCurrency(1234567)).toBe('1,234,567.00')
    })

    it('应该正确格式化小数', () => {
      expect(formatCurrency(1234.567)).toBe('1,234.57')
    })

    it('应该默认保留两位小数', () => {
      expect(formatCurrency(100)).toBe('100.00')
    })

    it('应该正确处理小数位四舍五入', () => {
      expect(formatCurrency(1.005)).toBe('1.01')
      expect(formatCurrency(1.004)).toBe('1.00')
    })
  })

  describe('字符串输入', () => {
    it('应该正确解析数字字符串', () => {
      expect(formatCurrency('1234.56')).toBe('1,234.56')
    })

    it('应该处理带空格的字符串', () => {
      expect(formatCurrency('  1234.56  ')).toBe('1,234.56')
    })

    it('应该处理空字符串', () => {
      expect(formatCurrency('')).toBe('0.00')
    })
  })

  describe('空值处理', () => {
    it('应该处理 null', () => {
      expect(formatCurrency(null)).toBe('0.00')
    })

    it('应该处理 undefined', () => {
      expect(formatCurrency(undefined)).toBe('0.00')
    })
  })

  describe('非法值处理', () => {
    it('应该处理 NaN', () => {
      expect(formatCurrency(Number.NaN)).toBe('0.00')
    })

    it('应该处理 Infinity', () => {
      expect(formatCurrency(Infinity)).toBe('0.00')
    })

    it('应该处理 -Infinity', () => {
      expect(formatCurrency(-Infinity)).toBe('0.00')
    })

    it('应该处理非数字字符串', () => {
      expect(formatCurrency('abc')).toBe('0.00')
    })
  })

  describe('小数位数配置', () => {
    it('应该支持自定义小数位数为 0', () => {
      expect(formatCurrency(1234.567, { decimalPlaces: 0 })).toBe('1,235')
    })

    it('应该支持自定义小数位数为 1', () => {
      expect(formatCurrency(1234.567, { decimalPlaces: 1 })).toBe('1,234.6')
    })

    it('应该支持自定义小数位数为 4', () => {
      expect(formatCurrency(1234.567891, { decimalPlaces: 4 })).toBe('1,234.5679')
    })
  })

  describe('千分位配置', () => {
    it('默认应该显示千分位', () => {
      expect(formatCurrency(1000000)).toBe('1,000,000.00')
    })

    it('应该支持禁用千分位', () => {
      expect(formatCurrency(1000000, { useGrouping: false })).toBe('1000000.00')
    })

    it('禁用千分位时小数位仍应生效', () => {
      expect(formatCurrency(1234.567, { useGrouping: false, decimalPlaces: 1 })).toBe('1234.6')
    })
  })

  describe('货币符号配置', () => {
    it('应该支持前缀货币符号', () => {
      expect(formatCurrency(100, { currencySymbol: '¥' })).toBe('¥100.00')
    })

    it('应该支持后缀货币单位', () => {
      expect(formatCurrency(100, { currencyUnit: '元' })).toBe('100.00元')
    })

    it('应该同时支持前缀和后缀', () => {
      expect(formatCurrency(100, { currencySymbol: '¥', currencyUnit: '元' })).toBe('¥100.00元')
    })
  })

  describe('负数处理', () => {
    it('默认应该使用负号格式', () => {
      expect(formatCurrency(-100)).toBe('-100.00')
    })

    it('应该支持负号格式（minus）', () => {
      expect(formatCurrency(-100, { negativeFormat: 'minus' })).toBe('-100.00')
    })

    it('应该支持括号格式（parentheses）', () => {
      expect(formatCurrency(-100, { negativeFormat: 'parentheses' })).toBe('(100.00)')
    })

    it('负数加货币符号应该正确显示（minus 格式）', () => {
      expect(formatCurrency(-100, { currencySymbol: '¥', negativeFormat: 'minus' })).toBe('¥-100.00')
    })

    it('负数加货币符号应该正确显示（parentheses 格式）', () => {
      expect(formatCurrency(-100, { currencySymbol: '¥', negativeFormat: 'parentheses' })).toBe('¥(100.00)')
    })

    it('负零应该显示为正常零', () => {
      expect(formatCurrency(-0)).toBe('0.00')
    })
  })

  describe('零值处理', () => {
    it('应该正确格式化 0', () => {
      expect(formatCurrency(0)).toBe('0.00')
    })

    it('零值带货币符号', () => {
      expect(formatCurrency(0, { currencySymbol: '¥' })).toBe('¥0.00')
    })

    it('零值带小数位配置', () => {
      expect(formatCurrency(0, { decimalPlaces: 4 })).toBe('0.0000')
    })
  })

  describe('复杂组合场景', () => {
    it('完整配置测试', () => {
      expect(formatCurrency(-1234567.89, {
        decimalPlaces: 2,
        currencySymbol: '¥',
        currencyUnit: '元',
        useGrouping: true,
        negativeFormat: 'parentheses',
      })).toBe('¥(1,234,567.89)元')
    })

    it('大数据格式化', () => {
      expect(formatCurrency(1234567890123.456)).toBe('1,234,567,890,123.46')
    })

    it('极小小数格式化', () => {
      expect(formatCurrency(0.001, { decimalPlaces: 4 })).toBe('0.0010')
    })
  })
})

describe('formatCNY', () => {
  it('应该正确格式化人民币', () => {
    expect(formatCNY(100)).toBe('¥100.00')
  })

  it('应该支持自定义选项', () => {
    expect(formatCNY(1234567, { decimalPlaces: 0, useGrouping: false })).toBe('¥1234567')
  })

  it('应该处理 null', () => {
    expect(formatCNY(null)).toBe('¥0.00')
  })

  it('应该支持负数', () => {
    expect(formatCNY(-100, { negativeFormat: 'parentheses' })).toBe('¥(100.00)')
  })
})

describe('formatUSD', () => {
  it('应该正确格式化美元', () => {
    expect(formatUSD(100)).toBe('$100.00')
  })

  it('应该支持自定义选项', () => {
    expect(formatUSD(1234567, { decimalPlaces: 0 })).toBe('$1,234,567')
  })

  it('应该处理 undefined', () => {
    expect(formatUSD(undefined)).toBe('$0.00')
  })

  it('应该支持负数', () => {
    expect(formatUSD(-100)).toBe('$-100.00')
  })
})
