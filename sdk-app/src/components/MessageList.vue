<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'

// Message type definition
interface Message {
  id: string | number
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

const props = defineProps<{
  messages: Message[]
  isTyping?: boolean
}>()

const messageListRef = ref<HTMLElement | null>(null)

// Auto-scroll to bottom when new messages arrive
const scrollToBottom = (): void => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

// Watch for new messages and scroll
watch(
  () => props.messages.length,
  () => {
    scrollToBottom()
  }
)

// Watch for typing indicator changes
watch(
  () => props.isTyping,
  () => {
    scrollToBottom()
  }
)

// Initial scroll on mount
onMounted(() => {
  scrollToBottom()
})

// Format timestamp for display
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

</script>

<template>
  <pre>
    {{ messages }}
  </pre>
  <div ref="messageListRef" class="message-list">
    <div v-if="messages.length === 0" class="message-list-empty">
      <p>No messages yet. Start a conversation!</p>
    </div>
    

    <div
      v-for="message in messages"
      :key="message.id"
      class="message"
      :class="[`message--${message.sender}`]"
    >
      <div class="message-bubble">
        <p class="message-text">{{ message.text }}</p>
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
      </div>
    </div>

    <div v-if="isTyping" class="message message--bot">
      <div class="message-bubble message-bubble--typing">
        <span class="typing-indicator">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
// Variables
$user-bubble-bg: #0066c0;
$user-bubble-color: #ffffff;
$bot-bubble-bg: #ffffff;
$bot-bubble-color: #333333;
$time-color: #999999;

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  height: 100%;
  overflow-y: auto;
}

.message-list-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  text-align: center;

  p {
    margin: 0;
  }
}

.message {
  display: flex;
  max-width: 80%;

  &--user {
    align-self: flex-end;

    .message-bubble {
      background-color: $user-bubble-bg;
      color: $user-bubble-color;
      border-radius: 16px 16px 4px 16px;
    }

    .message-time {
      color: rgba(255, 255, 255, 0.7);
    }
  }

  &--bot {
    align-self: flex-start;

    .message-bubble {
      background-color: $bot-bubble-bg;
      color: $bot-bubble-color;
      border-radius: 16px 16px 16px 4px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .message-time {
      color: $time-color;
    }
  }
}

.message-bubble {
  padding: 10px 14px;
  word-wrap: break-word;

  &--typing {
    padding: 14px 18px;
  }
}

.message-text {
  margin: 0 0 4px 0;
  white-space: pre-wrap;
}

.message-time {
  display: block;
  font-size: 11px;
  text-align: right;
}

// Typing indicator animation
.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background-color: #999;
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
  }
  30% {
    transform: translateY(-4px);
  }
}
</style>
