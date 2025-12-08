# SDK Global Events

The CXone WebChat SDK emits custom events to the global `window` object, allowing your application to listen and react to various SDK activities in real-time.

## Event Namespace

All SDK events are prefixed with `cxone-webchat:` to avoid conflicts with other libraries.

## Event Categories

### Connection Events

| Event Name | Description | Payload |
|------------|-------------|---------|
| `cxone-webchat:connection:connecting` | WebSocket is attempting to connect | `{ timestamp: number }` |
| `cxone-webchat:connection:connected` | WebSocket successfully connected | `{ timestamp: number }` |
| `cxone-webchat:connection:disconnected` | WebSocket disconnected | `{ reason: string, timestamp: number }` |
| `cxone-webchat:connection:reconnecting` | WebSocket is attempting to reconnect | `{ attempt: number, timestamp: number }` |
| `cxone-webchat:connection:error` | Connection error occurred | `{ error: string, timestamp: number }` |

### Message Events

| Event Name | Description | Payload |
|------------|-------------|---------|
| `cxone-webchat:message:sending` | User message is being sent | `{ messageId: string, content: string, timestamp: number }` |
| `cxone-webchat:message:sent` | User message successfully sent | `{ messageId: string, content: string, timestamp: number }` |
| `cxone-webchat:message:failed` | User message failed to send | `{ messageId: string, error: string, timestamp: number }` |
| `cxone-webchat:message:received:start` | Bot started responding (streaming begins) | `{ messageId: string, timestamp: number }` |
| `cxone-webchat:message:received:token` | Bot message token received (streaming) | `{ messageId: string, delta: string, timestamp: number }` |
| `cxone-webchat:message:received:complete` | Bot message fully received | `{ messageId: string, content: string, timestamp: number }` |

### Conversation Events

| Event Name | Description | Payload |
|------------|-------------|---------|
| `cxone-webchat:conversation:loaded` | Conversation loaded with messages | `{ conversationId: string, messageCount: number, timestamp: number }` |
| `cxone-webchat:conversation:switched` | User switched to different conversation | `{ conversationId: string, timestamp: number }` |
| `cxone-webchat:conversation:created` | New conversation created | `{ conversationId: string, timestamp: number }` |
| `cxone-webchat:conversation:deleted` | Conversation deleted | `{ conversationId: string, timestamp: number }` |

### Session Events

| Event Name | Description | Payload |
|------------|-------------|---------|
| `cxone-webchat:session:initialized` | Chat session initialized | `{ token: string, conversationId: string, timestamp: number }` |
| `cxone-webchat:session:error` | Session error occurred | `{ error: string, timestamp: number }` |

### UI Events

| Event Name | Description | Payload |
|------------|-------------|---------|
| `cxone-webchat:ui:tab:changed` | User switched between chat/history tabs | `{ tab: 'chat' \| 'history', timestamp: number }` |

## Usage Examples

### Listening to Specific Events

```javascript
// Listen to connection events
window.addEventListener('cxone-webchat:connection:connected', (event) => {
  console.log('Connected at:', new Date(event.detail.timestamp))
})

// Listen to message sent events
window.addEventListener('cxone-webchat:message:sent', (event) => {
  console.log('Message sent:', event.detail.content)
  // Send analytics
  analytics.track('message_sent', {
    messageId: event.detail.messageId,
    timestamp: event.detail.timestamp
  })
})

// Listen to conversation switches
window.addEventListener('cxone-webchat:conversation:switched', (event) => {
  console.log('Switched to conversation:', event.detail.conversationId)
  // Update your app state
  updateActiveConversation(event.detail.conversationId)
})
```

### Listening to All Events

```javascript
// Listen to all SDK events for debugging
const eventNames = [
  'connection:connecting',
  'connection:connected',
  'message:sent',
  'message:received:complete',
  'conversation:loaded',
  'session:initialized',
  'ui:tab:changed'
]

eventNames.forEach(eventName => {
  window.addEventListener(`cxone-webchat:${eventName}`, (event) => {
    console.log(`SDK Event [${eventName}]:`, event.detail)
  })
})
```

### TypeScript Usage

```typescript
import type { SDKEvents } from '@cxone/webchat-sdk'

// Type-safe event listener
window.addEventListener('cxone-webchat:message:sent', (event: CustomEvent<SDKEvents['message:sent']>) => {
  console.log('Message ID:', event.detail.messageId)
  console.log('Content:', event.detail.content)
  console.log('Timestamp:', event.detail.timestamp)
})
```

### Analytics Integration Example

```javascript
// Track user engagement
window.addEventListener('cxone-webchat:message:sent', (event) => {
  // Google Analytics
  gtag('event', 'webchat_message_sent', {
    message_id: event.detail.messageId,
    timestamp: event.detail.timestamp
  })

  // Mixpanel
  mixpanel.track('WebChat Message Sent', {
    messageId: event.detail.messageId,
    timestamp: event.detail.timestamp
  })
})

// Track bot response time
let responseStartTime = 0

window.addEventListener('cxone-webchat:message:received:start', (event) => {
  responseStartTime = event.detail.timestamp
})

window.addEventListener('cxone-webchat:message:received:complete', (event) => {
  const responseTime = event.detail.timestamp - responseStartTime
  analytics.track('bot_response_time', { duration: responseTime })
})
```

### Error Handling Example

```javascript
// Monitor connection issues
window.addEventListener('cxone-webchat:connection:error', (event) => {
  // Log to error tracking service
  Sentry.captureMessage('WebChat connection error', {
    level: 'error',
    extra: {
      error: event.detail.error,
      timestamp: event.detail.timestamp
    }
  })

  // Show user notification
  showNotification('Connection issue detected', 'error')
})

// Monitor message failures
window.addEventListener('cxone-webchat:message:failed', (event) => {
  console.error('Message failed:', event.detail.error)

  // Show retry option to user
  showRetryPrompt(event.detail.messageId)
})
```

### State Management Example

```javascript
// Sync SDK state with your app's state management
import { store } from './store'

window.addEventListener('cxone-webchat:conversation:loaded', (event) => {
  store.dispatch('updateActiveConversation', {
    id: event.detail.conversationId,
    messageCount: event.detail.messageCount
  })
})

window.addEventListener('cxone-webchat:session:initialized', (event) => {
  store.dispatch('setChatSession', {
    token: event.detail.token,
    conversationId: event.detail.conversationId,
    isActive: true
  })
})
```

## Performance Considerations

### Token Streaming Events

The `message:received:token` event is fired for every token during streaming. This can be many events per second. Consider:

1. **Throttling**: Use debounce/throttle if processing these events
2. **Filtering**: Filter these events in your listener if you only need the complete message
3. **Console**: These events appear in the browser console but may be filtered from debug panels

Example throttling:

```javascript
import { throttle } from 'lodash'

const handleToken = throttle((event) => {
  console.log('Token received:', event.detail.delta)
}, 100) // Only log every 100ms

window.addEventListener('cxone-webchat:message:received:token', handleToken)
```

## Removing Event Listeners

Always clean up event listeners when they're no longer needed:

```javascript
const messageHandler = (event) => {
  console.log('Message:', event.detail)
}

// Add listener
window.addEventListener('cxone-webchat:message:sent', messageHandler)

// Remove listener when done
window.removeEventListener('cxone-webchat:message:sent', messageHandler)
```

## Browser Compatibility

These events use the standard `CustomEvent` API and are supported in all modern browsers:
- Chrome/Edge 15+
- Firefox 11+
- Safari 6+
- All modern mobile browsers
