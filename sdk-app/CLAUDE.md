# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vue 3 Shadow DOM Chat Widget SDK - a JavaScript SDK for embedding a chat widget into any website. The widget renders inside Shadow DOM for style isolation and supports two usage patterns:
1. Script tag (`<script src="sdk.global.js" data-token="..." data-element="#container">`)
2. ES Module import (`import MyChatSDK from '@cxone/webchat-sdk'`)

## Commands

```bash
# From root directory (/cxone-webchat)
yarn install    # Install all workspace dependencies
yarn build      # Build SDK (outputs dist/sdk.esm.js and dist/sdk.global.js)
yarn dev        # Start test-app dev server with HMR (http://localhost:5173)

# Type checking
npx vue-tsc --noEmit   # Run TypeScript type check
```

## Project Structure

```
/cxone-webchat
  /sdk                          # SDK package (@cxone/webchat-sdk)
    /src
      /sdk-core                 # Core logic (no UI)
        types.ts                # TypeScript interfaces
        event-emitter.ts        # Internal event system
        config.ts               # Config parsing from script tags/options
        dom-utils.ts            # DOM manipulation utilities
      /components               # Vue 3 components
        ChatWidget.ce.vue       # Main widget (custom element)
        MessageList.vue         # Message display
        ChatInput.vue           # Input area
      /element                  # Custom element registration
        chat-element.ts         # defineCustomElement wrapper
      main.ts                   # SDK entry point, public API
    /dist                       # Build output
      sdk.esm.js               # ES Module bundle
      sdk.global.js            # IIFE bundle (auto-init, window.MyChatSDK)
  /test-app                     # Development test application
    index.html                  # Test page
    main.ts                     # ESM usage demo
```

## Technology Stack

- **Vue 3** with `defineCustomElement` for web components
- **Vite 5** for bundling and dev server
- **TypeScript 5** for type safety
- **SCSS** for styling (inside Shadow DOM)
- **Yarn workspaces** for monorepo

## SDK Public API

```typescript
window.MyChatSDK = {
  create(config: { token: string, element?: string | HTMLElement }): void
  sendMessage(message: string): void
  on(eventName: string, callback: Function): void
  off(eventName: string, callback: Function): void
}
```

## Key Architecture Points

- Custom element `<my-chat-widget>` wraps Vue app in Shadow Root (mode: 'open')
- No `createApp().mount()` on host page - everything through custom element
- Vue is bundled into the SDK - no external runtime dependency
- Single global: `window.MyChatSDK`
- Design supports multiple widget instances per page
- IIFE build auto-initializes from script tag data-* attributes

## Requirements Reference

See `vue-shadowdom-sdk-requirements.md` for complete specifications.
