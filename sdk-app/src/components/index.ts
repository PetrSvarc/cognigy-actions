// Chat Widget Components
// Main custom element component (for Shadow DOM usage)
export { default as ChatWidget } from './ChatWidget.ce.vue'

// Child components
export { default as MessageList } from './MessageList.vue'
export { default as ChatInput } from './ChatInput.vue'

// Message type for external use
export interface Message {
  id: number
  text: string
  isUser: boolean
}
