<script setup lang="ts">
/**
 * ChatInput Component
 *
 * A full-featured chat input component matching the Figma design.
 * Supports text input, voice recording, file attachments, and customizable watermark.
 */

import { ref, computed, watch } from 'vue'

// Types
export interface Attachment {
  name: string
  size: number
}

// Props
const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    disabled?: boolean
    attachments?: Attachment[]
    showWatermark?: boolean
    watermarkText?: string
    isRecording?: boolean
  }>(),
  {
    modelValue: '',
    placeholder: 'Type something...',
    disabled: false,
    attachments: () => [],
    showWatermark: true,
    watermarkText: 'Powered by Cognigy.AI',
    isRecording: false
  }
)

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
  send: []
  attach: []
  'remove-attachment': [index: number]
  'voice-start': []
  'voice-end': []
}>()

// Local state
const inputRef = ref<HTMLTextAreaElement | null>(null)
const localRecording = ref(false)

// Computed
const isRecordingActive = computed(() => props.isRecording || localRecording.value)
const hasContent = computed(() => props.modelValue.trim().length > 0)
const canSend = computed(() => hasContent.value && !props.disabled)
const hasAttachments = computed(() => props.attachments.length > 0)

// Methods
function updateValue(event: Event): void {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
  autoResize()
}

function autoResize(): void {
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
    inputRef.value.style.height = `${Math.min(inputRef.value.scrollHeight, 120)}px`
  }
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

function handleSend(): void {
  if (!canSend.value) return
  emit('send')
  // Reset textarea height after sending
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
  }
}

function handleAttach(): void {
  if (props.disabled) return
  emit('attach')
}

function handleRemoveAttachment(index: number): void {
  emit('remove-attachment', index)
}

function handleVoiceToggle(): void {
  if (props.disabled) return

  if (isRecordingActive.value) {
    localRecording.value = false
    emit('voice-end')
  } else {
    localRecording.value = true
    emit('voice-start')
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function focus(): void {
  inputRef.value?.focus()
}

// Watch for external recording state changes
watch(
  () => props.isRecording,
  (newVal) => {
    localRecording.value = newVal
  }
)

// Expose methods for parent component
defineExpose({
  focus
})
</script>

<template>
  <div
    class="chat-input-wrapper"
    :class="{
      'chat-input-wrapper--disabled': disabled,
      'chat-input-wrapper--recording': isRecordingActive
    }"
  >
    <!-- Attachments -->
    <div v-if="hasAttachments" class="chat-input-attachments">
      <div
        v-for="(attachment, index) in attachments"
        :key="`${attachment.name}-${index}`"
        class="chat-input-attachment"
      >
        <button
          type="button"
          class="chat-input-attachment__remove"
          :aria-label="`Remove ${attachment.name}`"
          @click="handleRemoveAttachment(index)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            width="14"
            height="14"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <span class="chat-input-attachment__name">{{ attachment.name }}</span>
        <span class="chat-input-attachment__size">{{ formatFileSize(attachment.size) }}</span>
      </div>
    </div>

    <!-- Input Container -->
    <div class="chat-input-container">
      <!-- Attach Button -->
      <button
        type="button"
        class="chat-input-btn chat-input-btn--attach"
        :disabled="disabled"
        aria-label="Attach file"
        @click="handleAttach"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          width="20"
          height="20"
        >
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
      </button>

      <!-- Text Input -->
      <textarea
        ref="inputRef"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled || isRecordingActive"
        class="chat-input-field"
        rows="1"
        aria-label="Message input"
        @input="updateValue"
        @keydown="handleKeydown"
      />

      <!-- Action Buttons -->
      <div class="chat-input-actions">
        <!-- Send Button -->
        <button
          type="button"
          class="chat-input-btn chat-input-btn--send"
          :disabled="!canSend"
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
    </div>

    <!-- Watermark -->
    <div v-if="showWatermark" class="chat-input-watermark">
      {{ watermarkText }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
// Design tokens
$primary-color: #3b82f6;
$primary-dark: #2563eb;
$text-color: #1f2937;
$text-muted: #9ca3af;
$border-color: #e5e7eb;
$background-light: #f9fafb;
$background-white: #ffffff;
$recording-bg: #f3e8ff;
$recording-btn-bg: #3b82f6;
$attachment-bg: #f3f4f6;
$attachment-border: #e5e7eb;
$disabled-opacity: 0.5;

// Transitions
$transition-fast: 150ms ease;
$transition-normal: 200ms ease;

.chat-input-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

  &--disabled {
    opacity: $disabled-opacity;
    pointer-events: none;
  }

  &--recording {
    .chat-input-container {
      background-color: $recording-bg;
      border-color: darken($recording-bg, 10%);
    }
  }
}

// Attachments
.chat-input-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 16px;
}

.chat-input-attachment {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background-color: $attachment-bg;
  border: 1px solid $attachment-border;
  border-radius: 16px;
  font-size: 13px;
  color: $text-color;

  &__remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 50%;
    color: $text-muted;
    cursor: pointer;
    transition: color $transition-fast, background-color $transition-fast;

    &:hover {
      color: $text-color;
      background-color: rgba(0, 0, 0, 0.08);
    }

    &:focus {
      outline: 2px solid $primary-color;
      outline-offset: 1px;
    }
  }

  &__name {
    font-weight: 500;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__size {
    color: $text-muted;
    font-size: 12px;
  }
}

// Input Container
.chat-input-container {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 12px;
  background-color: $background-white;
  border: 1px solid $border-color;
  border-radius: 24px;
  margin: 0 16px;
  transition: border-color $transition-normal, background-color $transition-normal, box-shadow $transition-normal;

  &:focus-within {
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-color, 0.1);
  }
}

// Text Input
.chat-input-field {
  flex: 1;
  min-height: 24px;
  max-height: 120px;
  padding: 4px 0;
  font-family: inherit;
  font-size: 15px;
  line-height: 1.5;
  color: $text-color;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  overflow-y: auto;

  &::placeholder {
    color: $text-muted;
  }

  &:disabled {
    cursor: not-allowed;
  }

  // Custom scrollbar
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: $border-color;
    border-radius: 2px;
  }
}

// Buttons
.chat-input-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: $text-muted;
  cursor: pointer;
  transition: color $transition-fast, background-color $transition-fast, transform $transition-fast;

  &:hover:not(:disabled) {
    color: $text-color;
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:focus {
    outline: 2px solid $primary-color;
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  // Attach button
  &--attach {
    margin-left: -4px;
  }

  // Voice button
  &--voice {
    &-active {
      color: $background-white;
      background-color: $recording-btn-bg;

      &:hover:not(:disabled) {
        background-color: $primary-dark;
        color: $background-white;
      }
    }
  }

  // Send button
  &--send {
    color: $primary-color;

    &:hover:not(:disabled) {
      color: $primary-dark;
      background-color: rgba($primary-color, 0.1);
    }

    &:disabled {
      color: $text-muted;
      opacity: 0.4;
    }
  }
}

// Actions container
.chat-input-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

// Watermark
.chat-input-watermark {
  padding: 8px 16px;
  font-size: 11px;
  color: $text-muted;
  text-align: center;
  user-select: none;
}
</style>
