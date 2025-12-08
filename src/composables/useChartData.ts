import type {
  ChartConfiguration,
  ChartData,
  ChartOptions,
  ScriptableContext,
} from 'chart.js'
import { computed } from 'vue'
import { useTableData } from './useTableData'

type CallReasonEntry = {
  reason: string
  volume: number
}

type TablePayload = {
  callReasons?: CallReasonEntry[]
}

const axisLabelColor = '#62728b'
const gridColor = 'rgba(12, 93, 173, 0.12)'
const borderColor = 'rgba(12, 93, 173, 0.9)'

export function useChartData() {
  const { tableData, shouldCreateChart, chartConfig } = useTableData()

  const parsedData = computed<CallReasonEntry[]>(() => {
    if (!tableData.value) return []
    try {
      const parsed = JSON.parse(tableData.value) as TablePayload | CallReasonEntry[]
      if (Array.isArray(parsed)) {
        return parsed
      }
      return parsed.callReasons ?? []
    } catch (error) {
      console.warn('[Insights] Unable to parse table data payload', error)
      return []
    }
  })

  const labels = computed(() => parsedData.value.map((entry) => entry.reason))
  const volumes = computed(() => parsedData.value.map((entry) => entry.volume))

  const remoteChartConfig = computed<ChartConfiguration | null>(() => {
    if (!chartConfig.value || typeof chartConfig.value !== 'object') return null
    return chartConfig.value as ChartConfiguration
  })

  const defaultChartData = computed<ChartData>(() => ({
    labels: labels.value,
    datasets: [
      {
        label: 'Call Volume',
        data: volumes.value,
        tension: 0.35,
        fill: true,
        borderWidth: 2,
        borderColor,
        pointBackgroundColor: '#fff',
        pointBorderColor: borderColor,
        pointHoverRadius: 5,
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const { ctx, chartArea } = context.chart
          if (!chartArea) return 'rgba(12, 93, 173, 0.12)'
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          gradient.addColorStop(0, 'rgba(12, 93, 173, 0.25)')
          gradient.addColorStop(1, 'rgba(12, 93, 173, 0.02)')
          return gradient
        },
      },
    ],
  }))

  const defaultChartOptions = computed<ChartOptions>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1f2a37',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        padding: 12,
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: axisLabelColor,
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: gridColor,
        },
        ticks: {
          color: axisLabelColor,
          callback: (value: string | number) => `${value}`,
        },
        suggestedMin: 0,
      },
    },
  }))

  const chartData = computed<ChartData>(
    () => (remoteChartConfig.value?.data as ChartData | undefined) ?? defaultChartData.value,
  )

  const chartOptions = computed<ChartOptions>(
    () => (remoteChartConfig.value?.options as ChartOptions | undefined) ?? defaultChartOptions.value,
  )

  const chartType = computed<'line' | 'bar'>(() => {
    const remoteType = (remoteChartConfig.value?.type as string | undefined)?.toLowerCase()
    if (remoteType === 'bar') return 'bar'
    return 'line'
  })

  const hasData = computed(
    () =>
      Boolean(remoteChartConfig.value?.data) ||
      (shouldCreateChart.value && volumes.value.length > 0),
  )

  return {
    chartData,
    chartOptions,
    chartType,
    hasData,
  }
}
