<script setup lang="ts">
import { computed } from 'vue'
import { renderMarkdown } from '../../sdk-core/utils/markdown'

interface StructuredResultColumn {
  id: string
  label: string
}

interface StructuredResult {
  type: 'table' | 'list'
  name?: string
  columns?: StructuredResultColumn[]
  rows?: any[]
  meta?: Record<string, unknown>
}

interface Props {
  groupId: string
  structuredResult?: StructuredResult
  streamingText?: string
  isStreaming?: boolean
  quickActionLabel?: string
}

const props = defineProps<Props>()

const hasTable = computed(() => props.structuredResult?.type === 'table')
const columns = computed(() => props.structuredResult?.columns || [])
const rows = computed(() => props.structuredResult?.rows || [])
const hasStreamingContent = computed(() => props.streamingText || props.isStreaming)

// Render streaming text as Markdown HTML
const renderedStreamingHtml = computed(() => {
  return props.streamingText ? renderMarkdown(props.streamingText) : ''
})
</script>

<template>
  <div class="dq-bubble">
    <div class="dq-bubble__header" v-if="structuredResult?.name">
      <span class="dq-bubble__title">{{ structuredResult.name }}</span>
      <span class="dq-bubble__subtitle">Data preview</span>
    </div>

    <!-- Table rendering -->
    <div v-if="hasTable" class="dq-bubble__table-wrapper">
      <table class="dq-bubble__table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.id">
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
            <td v-for="col in columns" :key="col.id">
              {{ row[col.id] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Streaming text section -->
    <div v-if="hasStreamingContent" class="dq-bubble__streaming">
      <div 
        v-if="streamingText" 
        class="dq-bubble__streaming-text dq-bubble__streaming-text--markdown"
        v-html="renderedStreamingHtml"
      />
      <div v-if="isStreaming" class="dq-bubble__streaming-indicator">
        <span class="dq-bubble__dot"></span>
        <span class="dq-bubble__dot"></span>
        <span class="dq-bubble__dot"></span>
      </div>
    </div>

    <!-- Quick action button is rendered by parent to keep behavior centralized -->
    <!-- Only show actions when streaming is complete -->
    <div v-if="!isStreaming" class="dq-bubble__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.dq-bubble {
  background: #0b1c2f;
  color: #f9fafb;
  border-radius: 12px;
  padding: 12px 14px;
  max-width: 100%;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.35);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dq-bubble__header {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.dq-bubble__title {
  font-size: 13px;
  font-weight: 600;
}

.dq-bubble__subtitle {
  font-size: 11px;
  color: #9ca3af;
}

.dq-bubble__table-wrapper {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.4);
}

.dq-bubble__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.dq-bubble__table th,
.dq-bubble__table td {
  padding: 6px 8px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.8);
}

.dq-bubble__table th {
  background: rgba(15, 23, 42, 0.9);
  text-align: left;
  font-weight: 500;
  color: #e5e7eb;
}

.dq-bubble__table tr:nth-child(even) td {
  background: rgba(15, 23, 42, 0.6);
}

.dq-bubble__streaming {
  font-size: 12px;
  color: #e5e7eb;
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dq-bubble__streaming-text {
  line-height: 1.5;
}

.dq-bubble__streaming-text--markdown {
  :deep(p) {
    margin: 0 0 8px 0;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(ul),
  :deep(ol) {
    margin: 8px 0;
    padding-left: 24px;
  }

  :deep(li) {
    margin: 4px 0;
  }

  :deep(code) {
    background: rgba(0, 0, 0, 0.2);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 11px;
  }

  :deep(pre) {
    background: rgba(0, 0, 0, 0.3);
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 8px 0;

    code {
      background: none;
      padding: 0;
    }
  }

  :deep(strong) {
    font-weight: 600;
  }

  :deep(em) {
    font-style: italic;
  }

  :deep(a) {
    color: #60a5fa;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  :deep(blockquote) {
    border-left: 3px solid rgba(148, 163, 184, 0.4);
    padding-left: 12px;
    margin: 8px 0;
    color: #9ca3af;
  }

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    margin: 12px 0 8px 0;
    font-weight: 600;
  }

  :deep(h1) { font-size: 16px; }
  :deep(h2) { font-size: 15px; }
  :deep(h3) { font-size: 14px; }
  :deep(h4) { font-size: 13px; }
  :deep(h5) { font-size: 12px; }
  :deep(h6) { font-size: 12px; }
}

.dq-bubble__streaming-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px 0;
}

.dq-bubble__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #9ca3af;
  animation: pulse 1.4s ease-in-out infinite;
  
  &:nth-child(1) {
    animation-delay: 0s;
  }
  
  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  &:nth-child(3) {
    animation-delay: 0.4s;
  }
}

@keyframes pulse {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.dq-bubble__actions {
  margin-top: 4px;
}
</style>


