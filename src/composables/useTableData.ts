import { readonly, ref } from 'vue'

const tableData = ref<string | null>(null)
const shouldCreateChart = ref(false)

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

  const markChartReady = () => {
    shouldCreateChart.value = true
  }

  const clearTableData = () => {
    tableData.value = null
    shouldCreateChart.value = false
  }

  return {
    tableData: readonly(tableData),
    shouldCreateChart: readonly(shouldCreateChart),
    setTableData,
    markChartReady,
    clearTableData,
  }
}
