// Molecules - composed from atoms
export { default as BotMessage } from './BotMessage.vue'
export { default as UserMessage } from './UserMessage.vue'
export { default as ChatInput } from './ChatInput.vue'
export { default as ChatHeader } from './ChatHeader.vue'
export { default as DataQueryBubble } from './DataQueryBubble.vue'
export { default as AppEvent } from './AppEvent.vue'

// Simplified components (matching goal.png)
export { default as SimpleHeader } from './SimpleHeader.vue'
export { default as SimpleInput } from './SimpleInput.vue'
export { default as TabBar } from './TabBar.vue'
export { default as ConversationList } from './ConversationList.vue'

// Re-export types
export type { BotMessageData } from './BotMessage.vue'
export type { UserMessageData, Attachment } from './UserMessage.vue'
export type { TabId } from './TabBar.vue'
export type { ConversationItem } from './ConversationList.vue'
