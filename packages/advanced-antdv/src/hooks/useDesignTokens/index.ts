import { reactive } from 'vue'

export function useDesignTokens() {
  const rootStyles = getComputedStyle(document.documentElement)

  const tokens = reactive({
    borderRadius: '' as any,
    colorBgBase: '',
    colorBgContainer: '',
    colorBgElevated: '',
    colorBgLayout: '',
    colorBgMask: '',
    colorBorder: '',
    colorBorderSecondary: '',
    colorError: '',
    colorInfo: '',
    colorPrimary: '',
    colorSuccess: '',
    colorTextBase: '',
    colorWarning: '',
    zIndexPopupBase: 2000, // 调整基础弹层层级，避免下拉等组件被弹窗或者最大化状态下的表格遮挡
  })

  const getCssVariableValue = (variable: string, isColor: boolean = true) => {
    const value = rootStyles.getPropertyValue(variable)
    return isColor ? `hsl(${value})` : value
  }

  function updateTokens() {
    tokens.colorPrimary = getCssVariableValue('--primary')

    tokens.colorInfo = getCssVariableValue('--primary')

    tokens.colorError = getCssVariableValue('--destructive')

    tokens.colorWarning = getCssVariableValue('--warning')

    tokens.colorSuccess = getCssVariableValue('--success')

    tokens.colorTextBase = getCssVariableValue('--foreground')

    getCssVariableValue('--primary-foreground')

    tokens.colorBorderSecondary = tokens.colorBorder
      = getCssVariableValue('--border')

    tokens.colorBgElevated = getCssVariableValue('--popover')

    tokens.colorBgContainer = getCssVariableValue('--card')

    tokens.colorBgBase = getCssVariableValue('--background')

    const radius = Number.parseFloat(getCssVariableValue('--radius', false))
    // 1rem = 16px
    tokens.borderRadius = radius * 16

    tokens.colorBgLayout = getCssVariableValue('--background-deep')
    tokens.colorBgMask = getCssVariableValue('--overlay')
  }

  return {
    tokens,
    getCssVariableValue,
    updateTokens,
  }
}
