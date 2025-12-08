/**
 * WebSocket Module
 *
 * Exports for the Socket.IO chat client
 */

export { ChatSocket } from './chatSocket'
export type { ChatSocketConfig } from './chatSocket'
export type {
  ChatSocketEventHandlers,
  ConnectionState,
  InitPayload,
  UserMessagePayload,
  ServerEvent,
  InitAckPayload,
  AssistantMessageStartedPayload,
  AssistantTokenPayload,
  AssistantMessageFinishedPayload,
  ErrorPayload,
  BackendMessage,
} from './types'
