<script setup lang="ts">
/**
 * Simple Header Component
 * Header with title on left and action buttons on right
 */

export type TabId = 'chat' | 'history'

const props = defineProps<{
  title?: string
  activeTab?: TabId
}>()

const emit = defineEmits<{
  'update:activeTab': [tab: TabId]
  'new-chat': []
}>()

function switchTab(tab: TabId) {
  emit('update:activeTab', tab)
}
</script>

<template>
  <header class="simple-header">
    <h1 class="header-title">{{ title || 'CXOne WebChat' }}</h1>
  </header>
</template>

<style lang="scss" scoped>
.simple-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #1E3A5F;
  color: #fff;
  flex-shrink: 0;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.3px;
}
</style>
