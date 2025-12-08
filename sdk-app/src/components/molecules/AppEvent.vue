<script setup lang="ts">
/**
 * AppEvent Component
 *
 * Displays app events from the backend in a structured, visually appealing way.
 * Handles various event types dynamically and provides specific rendering for known types.
 */

import { computed } from 'vue'
import type { AppEventPayload } from '../../sdk-core/websocket/types'

interface Props {
  event: AppEventPayload
}

const props = defineProps<Props>()
const emit = defineEmits<{
  action: [actionType: string, data: any]
}>()

// Event type display configurations
const eventTypeConfig: Record<string, { icon: string; label: string; color: string }> = {
  email_draft_created: {
    icon: '✉️',
    label: 'Email Draft Created',
    color: '#10B981' // green
  },
  data_query_quick_action: {
    icon: '⚡',
    label: 'Quick Action Available',
    color: '#F59E0B' // amber
  },
  data_query_result: {
    icon: '📊',
    label: 'Data Query Result',
    color: '#3B82F6' // blue
  },
  data_query_overview: {
    icon: '📝',
    label: 'Data Overview',
    color: '#8B5CF6' // purple
  },
  tool_execution: {
    icon: '🔧',
    label: 'Tool Executed',
    color: '#6366F1' // indigo
  },
  draft_opened: {
    icon: '📄',
    label: 'Draft Opened',
    color: '#06B6D4' // cyan
  }
}

// Get display info for the event type
const eventInfo = computed(() => {
  return eventTypeConfig[props.event.eventType] || {
    icon: '🔔',
    label: formatEventType(props.event.eventType),
    color: '#6B7280' // gray
  }
})

// Format event type for display (snake_case to Title Case)
function formatEventType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Check if data is a simple object (for key-value display)
const isSimpleObject = computed(() => {
  const data = props.event.data
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false
  }
  // Check if all values are primitive
  return Object.values(data).every(val =>
    typeof val === 'string' ||
    typeof val === 'number' ||
    typeof val === 'boolean' ||
    val === null
  )
})

// Get displayable data entries
const dataEntries = computed(() => {
  if (!isSimpleObject.value) return []

  return Object.entries(props.event.data)
    .map(([key, value]) => ({
      key: formatKey(key),
      value: formatValue(value)
    }))
})

// Format object key for display
function formatKey(key: string): string {
  // Convert camelCase or snake_case to Title Case
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim()
}

// Format value for display
function formatValue(value: any): string {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

// Check for actionable buttons
const hasAction = computed(() => {
  return props.event.data?.actionType ||
         props.event.data?.draftId ||
         props.event.eventType === 'data_query_quick_action'
})

// Handle action click
function handleAction() {
  if (props.event.data?.actionType) {
    emit('action', props.event.data.actionType, props.event.data)
  } else if (props.event.data?.draftId) {
    emit('action', 'open_draft', props.event.data)
  }
}

// Get action button label
const actionLabel = computed(() => {
  if (props.event.data?.label) return props.event.data.label
  if (props.event.data?.draftId) return 'Open Draft'
  if (props.event.data?.actionType) return formatEventType(props.event.data.actionType)
  return 'View'
})
</script>

<template>
  <div class="app-event">
    <!-- Event Header -->
    <div class="app-event__header">
      <span class="app-event__icon" :style="{ color: eventInfo.color }">
        {{ eventInfo.icon }}
      </span>
      <span class="app-event__label">{{ eventInfo.label }}</span>
      <span v-if="event.groupId" class="app-event__group-id" :title="event.groupId">
        #{{ event.groupId.split('-').pop() }}
      </span>
    </div>

    <!-- Event Data Display -->
    <div v-if="dataEntries.length > 0" class="app-event__data">
      <div
        v-for="entry in dataEntries"
        :key="entry.key"
        class="app-event__data-row"
      >
        <span class="app-event__data-key">{{ entry.key }}:</span>
        <span class="app-event__data-value">{{ entry.value }}</span>
      </div>
    </div>

    <!-- Complex Data Display -->
    <div v-else-if="event.data && typeof event.data === 'object'" class="app-event__data">
      <pre class="app-event__data-json">{{ JSON.stringify(event.data, null, 2) }}</pre>
    </div>

    <!-- Action Button -->
    <div v-if="hasAction" class="app-event__actions">
      <button
        type="button"
        class="app-event__action-btn"
        :style="{ borderColor: eventInfo.color, color: eventInfo.color }"
        @click="handleAction"
      >
        {{ actionLabel }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-event {
  background: #F9FAFB;
  border-left: 2px solid #E5E7EB;
  border-radius: 8px;
  padding: 8px 10px;
  max-width: 75%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin-left: 44px; // Align with bot messages (avatar + gap)
}

.app-event__header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.app-event__icon {
  font-size: 14px;
  line-height: 1;
  flex-shrink: 0;
}

.app-event__label {
  font-size: 12px;
  font-weight: 500;
  color: #4B5563;
  flex: 1;
}

.app-event__group-id {
  font-size: 9px;
  color: #9CA3AF;
  background: #F3F4F6;
  padding: 1px 4px;
  border-radius: 3px;
  font-family: 'SF Mono', Monaco, monospace;
}

.app-event__data {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 8px;
  background: #F3F4F6;
  border-radius: 4px;
}

.app-event__data-row {
  display: flex;
  gap: 6px;
  font-size: 11px;
  line-height: 1.4;
}

.app-event__data-key {
  color: #6B7280;
  font-weight: 500;
  min-width: 70px;
  flex-shrink: 0;
}

.app-event__data-value {
  color: #374151;
  word-break: break-word;
}

.app-event__data-json {
  margin: 0;
  padding: 6px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 4px;
  color: #4B5563;
  font-size: 10px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  overflow-x: auto;
  line-height: 1.4;
}

.app-event__actions {
  display: flex;
  gap: 6px;
  margin-top: 2px;
}

.app-event__action-btn {
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 4px;
  border: 1px solid;
  background: #FFFFFF;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: currentColor;
    color: #FFFFFF !important;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: scale(0.98);
  }
}
</style>
