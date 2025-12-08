
# State Management Extension Specification — TanStack Query Core Integration

## Overview

This document defines the **second development phase** of the SDK:  
Add a **reactive server-state layer** powered by **@tanstack/query-core**, including streaming support, retry logic, a query cache, and a small Vue adapter layer.

The goal is:

- Keep the SDK’s **core logic UI-agnostic** (works without Vue).  
- Let Vue widget consume fully reactive data via a minimal **bridge layer**.  
- Maintain complete support for both **script-tag** and **ESM** usage.  
- Keep everything **bundled**, **lightweight**, and **framework-neutral**.

This document assumes the initial SDK structure (Vue CE, Shadow DOM, Vite build, dev/test apps) is already implemented.

---

## 1. High-Level Architecture

TanStack Query integration must follow this architecture:

```
[ SDK Core ]
    ↓
[ QueryClient (tanstack/query-core) ]
    ↓
[ Vue Adapter Layer (useCoreQuery / composables) ]
    ↓
[ Vue Shadow DOM Custom Element (UI) ]
```

### Key principles:

1. **SDK Core owns one QueryClient instance**  
2. **Vue CE never directly uses TanStack Query**  
3. **Streaming events update cache via `setQueryData`**  
4. **Retry, cache, staleTime handled inside core**

---

## 2. Dependencies

Add only:

```
@tanstack/query-core
```

Do **not** add any framework-specific adapters.

---

## 3. Query Client Initialization

Create `/sdk/src/sdk-core/queryClient.ts` containing:

- Single `QueryClient` instance  
- Defaults:
  - retries enabled
  - exponential backoff
  - `staleTime: 0`

Used for all chat-related queries/mutations.

---

## 4. Core-Level Queries & Mutations

### Queries

Implement factories:

- `getSessionQuery(token)`
- `getMessagesQuery(conversationId)`
- `getConversationQuery(conversationId)`
- optional pagination queries

Each returns `{ queryKey, queryFn }`.

### Mutations

Implement:

- `sendMessageMutation(conversationId, payload)`

Must support:

- optimistic update  
- rollback  
- invalidation  
- integration with stream updates  

### Streaming

For SSE/WebSocket:

Use:

```ts
queryClient.setQueryData(['messages', convId], old => [...old, newMessage])
```

All message updates flow through TanStack cache.

---

## 5. Vue Adapter Layer

Create:

`/sdk/src/element/useCoreQuery.ts`

### `useCoreQuery(options)`

Implements:

- `QueryObserver`
- wraps result in Vue `ref`
- subscribe/unsubscribe lifecycle

### Composables

In `/sdk/src/element/composables/`:

- `useMessages(conversationId)`
- `useSession(token)`
- `useConversation(conversationId)`
- `useSendMessage(conversationId)`

These are the ONLY data entry points into UI.

---

## 6. UI Layer Changes

Vue CE should:

```ts
const messagesQuery = useMessages(props.conversationId)
const sendMessage = useSendMessage(props.conversationId)
```

UI reacts to:

- `isLoading`
- `error`
- `data`
- `isFetching`

---

## 7. Error & Retry Handling

TanStack handles logic automatically.

UI must expose:

- error states  
- `refetch()`  
- optimistic updates  

---

## 8. Test App Updates

Add demonstrations for:

- message loading  
- optimistic send  
- retry  
- forced error states  
- mock streaming  

Add optional debug UI showing query cache state.

---

## 9. Deliverables

1. QueryClient initialization  
2. Queries & mutations  
3. Streaming integration  
4. Vue adapter layer (useCoreQuery + composables)  
5. Updated Vue UI  
6. Updated test app  
7. TypeScript everywhere  

---

## 10. Questions for the Implementer

1. Should queries/mutations be grouped or separated?  
2. WebSocket, SSE, or mock streaming first?  
3. Should the Vue composables unwrap fields or keep `state.value` shape?  
4. Should mutations expose helpers or raw mutation objects?  
5. Should integration tests be added?  

