import type { ChartConfiguration } from 'chart.js'
import { readonly, ref } from 'vue'

const tableData = ref<string | null>(null)
const shouldCreateChart = ref(false)
const chartConfig = ref<ChartConfiguration | null>(null)

export function useTableData() {
  const setTableData = (raw: unknown) => {
    console.log('[Insights] raw table payload received', raw)
    try {
      tableData.value = typeof raw === 'string' ? raw : JSON.stringify(raw)
      console.debug('[Insights] stored table data payload', tableData.value)
    } catch (error) {
      console.warn('[Cognigy Webchat] Failed to stringify table data payload', error)
      tableData.value = null
    }
  }

  const setChartConfig = (raw: unknown) => {
    if (raw && typeof raw === 'object') {
      chartConfig.value = raw as ChartConfiguration
      console.debug('[Insights] stored remote chart configuration', chartConfig.value)
    } else {
      console.warn('[Insights] invalid chart configuration payload, clearing config', raw)
      chartConfig.value = null
    }
  }

  const markChartReady = () => {
    shouldCreateChart.value = true
  }

  const clearTableData = () => {
    tableData.value = null
    shouldCreateChart.value = false
    chartConfig.value = null
  }

  return {
    tableData: readonly(tableData),
    shouldCreateChart: readonly(shouldCreateChart),
    chartConfig: readonly(chartConfig),
    setTableData,
    setChartConfig,
    markChartReady,
    clearTableData,
  }
}
