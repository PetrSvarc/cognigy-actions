<script setup lang="ts">
/**
 * Tab Bar Component
 * Bottom navigation with icons - matches goal.png design
 */

export type TabId = 'chat' | 'history'

const props = withDefaults(defineProps<{
  activeTab?: TabId
}>(), {
  activeTab: 'chat'
})

const emit = defineEmits<{
  'update:activeTab': [tab: TabId]
}>()

function selectTab(tab: TabId) {
  emit('update:activeTab', tab)
}
</script>

<template>
  <div class="tab-bar">
    <button
      class="tab-item"
      :class="{ active: activeTab === 'chat' }"
      @click="selectTab('chat')"
      aria-label="Current Chat"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <span class="tab-label">Chat</span>
    </button>

    <button
      class="tab-item"
      :class="{ active: activeTab === 'history' }"
      @click="selectTab('history')"
      aria-label="Conversation History"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <span class="tab-label">History</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
$primary-blue: #3B5EFF;
$text-gray: #6B7280;
$border-color: #E5E7EB;

.tab-bar {
  display: flex;
  border-top: 1px solid $border-color;
  background: #fff;
  flex-shrink: 0;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: $text-gray;
  transition: color 0.15s ease;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 3px;
    background: $primary-blue;
    border-radius: 0 0 3px 3px;
    transition: width 0.2s ease;
  }

  &:hover {
    color: darken($text-gray, 20%);
  }

  &.active {
    color: $primary-blue;

    &::before {
      width: 48px;
    }
  }

  svg {
    width: 22px;
    height: 22px;
  }
}

.tab-label {
  font-size: 11px;
  font-weight: 500;
}
</style>
