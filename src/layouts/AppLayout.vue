<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useCognigyWebchat } from '@/composables/useCognigyWebchat'

const { status, init, open } = useCognigyWebchat()

const isChatReady = computed(() => status.value === 'ready')

const tabs = [
  { label: 'Insights', to: '/insights' },
  { label: 'Email', to: '/email' },
  { label: 'Knowledge Article', to: '/knowledge' },
]

onMounted(() => {
  void init()
})

const handleOpenChat = () => {
  open()
}
</script>

<template>
  <div class="app-shell">
    <header class="app-header glass-panel">
      <div class="branding">
        <span class="brand-mark" aria-hidden="true"></span>
        <div>
          <p class="eyebrow">CXone</p>
          <strong>Actions Studio</strong>
        </div>
      </div>
      <div class="header-actions">
        <button class="ghost-button" type="button" :disabled="!isChatReady" @click="handleOpenChat">
          {{ isChatReady ? 'Open Webchat' : 'Loading Webchat' }}
        </button>
      </div>
    </header>

    <main class="content-panel glass-panel">
      <nav class="primary-tabs">
        <RouterLink v-for="tab in tabs" :key="tab.to" :to="tab.to" class="tab-link">
          {{ tab.label }}
        </RouterLink>
      </nav>
      <slot />
    </main>
  </div>
</template>
