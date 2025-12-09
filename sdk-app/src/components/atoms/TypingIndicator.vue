<script setup lang="ts">
/**
 * Typing Indicator Component
 *
 * Displays an animated three-dot indicator to show that
 * someone is typing. Styled to look like a chat bubble.
 */

export type TypingIndicatorSize = 'sm' | 'md'

interface Props {
  /** Size variant of the typing indicator */
  size?: TypingIndicatorSize
}

withDefaults(defineProps<Props>(), {
  size: 'md'
})
</script>

<template>
  <div
    class="typing-indicator"
    :class="`typing-indicator--${size}`"
    role="status"
    aria-label="Someone is typing"
  >
    <span class="typing-indicator__dot" />
    <span class="typing-indicator__dot" />
    <span class="typing-indicator__dot" />
  </div>
</template>

<style scoped lang="scss">
$background-color: #F3F4F6;
$dot-color: #6B7280;

.typing-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: $background-color;
  border-radius: 16px;

  // Size variants
  &--sm {
    padding: 8px 12px;
    gap: 3px;
    border-radius: 12px;

    .typing-indicator__dot {
      width: 6px;
      height: 6px;
    }
  }

  &--md {
    padding: 12px 16px;
    gap: 4px;
    border-radius: 16px;

    .typing-indicator__dot {
      width: 8px;
      height: 8px;
    }
  }
}

.typing-indicator__dot {
  display: block;
  background: $dot-color;
  border-radius: 50%;
  animation: typing-bounce 1.4s ease-in-out infinite;

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

@keyframes typing-bounce {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-6px);
    opacity: 1;
  }
}
</style>
