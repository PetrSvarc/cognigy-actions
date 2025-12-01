<script setup lang="ts">
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  BarElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { Bar, Line } from 'vue-chartjs'
import { useChartData } from '@/composables/useChartData'

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Filler,
  Legend,
)

const { chartData, chartOptions, chartType, hasData } = useChartData()
</script>

<template>
  <section class="chart-card glass-panel">
    <header class="chart-header">
      <div>
        <p class="eyebrow">Engagement trend</p>
        <strong>Weekly Impact</strong>
      </div>
      <span class="pill pill-positive">+18.4%</span>
    </header>
    <div v-if="hasData" class="chart-wrapper">
      <component :is="chartType === 'bar' ? Bar : Line" :data="chartData" :options="chartOptions" />
    </div>
    <p v-else class="chart-placeholder">
      Waiting for Insights data. Ask CXone to either send a `chartConfig` object together with
      <code>createChart: true</code>, or provide the `hasTableData` payload and a follow-up message with
      <code>createChart: true</code>.
    </p>
  </section>
</template>

<style scoped>
.chart-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  min-height: 280px;
}

.chart-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.chart-header strong {
  font-size: 1.25rem;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.pill-positive {
  color: rgba(34, 197, 94, 0.95);
  background: rgba(34, 197, 94, 0.1);
}

.chart-wrapper {
  flex: 1;
  min-height: 200px;
}

.chart-wrapper canvas {
  width: 100% !important;
  height: 100% !important;
}

.chart-placeholder {
  margin: 0;
  color: var(--cxone-muted-text);
  padding: 1.5rem 0;
  text-align: center;
}
</style>
