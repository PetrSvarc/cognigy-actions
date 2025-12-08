<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  send: [text: string]
}>()

const inputText = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

const handleSend = (): void => {
  const text = inputText.value.trim()

  if (!text) return

  emit('send', text)
  inputText.value = ''

  // Keep focus on input after sending
  inputRef.value?.focus()
}

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="chat-input">
    <input
      ref="inputRef"
      v-model="inputText"
      type="text"
      class="chat-input-field"
      placeholder="Type a message..."
      aria-label="Message input"
      @keydown="handleKeydown"
    />
    <button
      type="button"
      class="chat-input-button"
      :disabled="!inputText.trim()"
      aria-label="Send message"
      @click="handleSend"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        width="20"
        height="20"
      >
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
      </svg>
    </button>
  </div>
</template>

<style lang="scss">
// Variables
$primary-color: #0066cc;
$primary-hover: #0052a3;
$border-color: #e0e0e0;
$disabled-color: #cccccc;

.chat-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 32px;
}

.chat-input-field {
  flex: 1;
  padding: 10px 14px;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.5;
  color: #333;
  background-color: #f5f5f5;
  border: 1px solid $border-color;
  border-radius: 20px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: #999;
  }

  &:focus {
    border-color: $primary-color;
    box-shadow: 0 0 0 2px rgba($primary-color, 0.1);
  }
}

.chat-input-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background-color: $primary-color;
  color: #ffffff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background-color: $primary-hover;
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    background-color: $disabled-color;
    cursor: not-allowed;
  }

  &:focus {
    outline: 2px solid $primary-color;
    outline-offset: 2px;
  }

  svg {
    transform: translateX(1px);
  }
}
</style>
