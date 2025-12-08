
# SDK Requirements Document — Vue 3 Shadow DOM Chat Widget (Vite Build)

## 1. Overview

Build a **basic JavaScript SDK** that allows embedding a **Vue 3-based chat widget** into any website with **one line of code**.

The widget must be rendered inside a **Shadow DOM** to ensure style isolation. The SDK must work both:

1. On **plain HTML sites** using a `<script src="...">` tag  
2. Inside **SPA applications** imported via `import SDK from 'my-sdk'`

The SDK should expose a **simple public API**, automatically bootstrap itself, and render a minimal UI (placeholder chat messages, buttons, chat input — exact design is not important).

The project must use **Vite** as the bundler, **Vue 3** for the UI, and **SCSS** by default. There must be **no unnecessary dependencies**.

The repository must also include a **small test application** to preview the widget during development, with full **hot reload (HMR)** for both the SDK and the test app.

---

## 2. Project Structure

A suggested structure (you may adjust if needed, as long as the behavior matches the requirements):

```text
/sdk
  /src
    /sdk-core          → SDK logic (initialization, mounting, public API)
    /components        → Vue components for the widget UI
    /element           → Vue custom element entry
    main.ts            → SDK entry point for bundling
  package.json
  vite.config.ts

/test-app
  index.html or main.ts
  vite.config.ts

package.json (root workspace)
```

The repository should be set up as a single workspace using **Yarn**.

---

## 3. SDK Requirements

### 3.1 One-line Initialization

The SDK must support **two ways of usage**: via script tag and via ESM import.

#### A) Script-tag usage

Example:

```html
<div id="chat-container"></div>
<script
  src="https://cdn.example.com/sdk.global.js"
  data-token="TOKEN_VALUE"
  data-element="#chat-container">
</script>
```

Behavior:

- When the script loads, the SDK must automatically:
  - Read configuration from its own `data-*` attributes (`data-token`, `data-element`, etc.).
  - Create or select the target DOM element (`data-element` may be a CSS selector or may be omitted; if omitted, the SDK should create a container automatically).
  - Mount the Vue widget (custom element) into that element.
  - Expose a global API object on `window` (e.g. `window.MyChatSDK`).

No additional inline initialization code should be required for this usage. One script tag should be enough to render the widget.

#### B) ES Module usage

Example:

```ts
import MyChatSDK from 'my-sdk'

MyChatSDK.create({
  token: 'TOKEN_VALUE',
  element: '#chat-container'
})
```

Behavior:

- `create` performs the same initialization logic as the script tag mode:
  - Selects or creates the target container.
  - Mounts the widget inside it.
- The ESM usage should be fully tree-shakeable.

---

### 3.2 Vue 3 + Shadow DOM

- Use **Vue 3** and **`defineCustomElement`** to implement the UI as a **custom element**.
- The widget must be rendered inside a **Shadow Root (`mode: 'open'`)** to ensure style isolation.
- All styling should live inside the shadow DOM and use **SCSS**.
- A single root custom element is expected, for example `<my-chat-widget>`.

Minimal UI requirements (placeholder only, no real backend needed):

- A chat container (box or panel).
- A list of messages.
- A text input for typing a message.
- A send button.

The appearance is not important; this is only a placeholder UI to demonstrate the SDK and the isolated app.

---

### 3.3 SDK Architecture

The SDK should be split conceptually into:

1. **Core logic (non-UI)**
   - Parsing configuration (from script tag `data-*` attributes or from the `create()` options).
   - Handling public API calls.
   - Providing a simple internal event emitter (no external library).
   - Managing instances if multiple widgets are ever needed (at least keep the design open to multiple instances in the future).

2. **UI rendering layer (Vue + custom element)**
   - The Vue custom element represents the whole widget.
   - The SDK core is responsible for:
     - Registering the custom element (e.g. `customElements.define('my-chat-widget', ...)`).
     - Creating/mounting the element into the chosen container.

#### Public API

Expose a global object, for example:

```ts
window.MyChatSDK = {
  create(config),          // main entry point
  sendMessage(message),    // placeholder for future backend integration
  on(eventName, callback), // minimal event emitter
  off(eventName, callback)
}
```

For now, these methods can be placeholders or have only minimal internal logic (no server calls required). The important part is to structure the SDK API cleanly so it can be extended later.

#### No global Vue app mount

Do **not** use the classic `createApp(...).mount('#app')` pattern on the host page. Instead, work **only through the custom element**, which lives in its own shadow DOM.

---

## 4. Build Requirements

Use **Vite** to build the SDK.

### 4.1 Build Output (`yarn build`)

The `yarn build` command at the repository root must:

- Build **only the SDK** (not the test app).
- Produce at least:
  - An **ESM bundle** for module usage, e.g. `dist/sdk.esm.js`.
  - An **IIFE or UMD bundle** for script-tag usage, e.g. `dist/sdk.global.js`.

The global build should attach the SDK to `window` (e.g. `window.MyChatSDK`), and it should automatically initialize itself if script-tag attributes are present.

All required code should be bundled; there should be **no external runtime dependency** (i.e. do not require an external Vue runtime at runtime — everything is bundled together).

### 4.2 Tech stack

- **Vite** as the build tool.
- **TypeScript** for all source files (`.ts` / `.vue`).
- **SCSS** as the default styling language.
- No unnecessary libraries: avoid additional UI libraries, state management libraries, etc.

Optionally (recommended): the build may output **TypeScript declaration files (`.d.ts`)** for the SDK API, but this is not mandatory unless it significantly complicates the setup.

---

## 5. Development & Hot Reload (HMR)

### 5.1 `yarn dev` behavior

The command `yarn dev` (at the repository root) should:

- Start a Vite dev server for the **test application**.
- Use the SDK project as a local dependency (e.g. via Yarn workspaces / path alias) so that:
  - Any changes in `/sdk/src`:
    - Rebuild the SDK in dev mode.
    - Trigger Hot Module Replacement (HMR) in the test app.
  - Any changes in the test app files also trigger HMR.

**Goal:** When editing either the SDK source (Vue components, SCSS, TypeScript) or the test app, the browser should update automatically without a full manual refresh.

### 5.2 HMR expectations

- When source files in the SDK (`/sdk/src`) are changed:
  - Vite should apply HMR to the test app.
  - The Vue custom element in the test app should be updated. It is acceptable if this triggers a remount of the widget and resets internal state — this is fine for development.

- The Shadow DOM does **not** block HMR — the hot-reloaded code will just recreate the custom element or update it through Vue’s internal mechanisms.

- In dev mode, the test app should import the SDK via **ESM** (not via the built IIFE bundle). This is important so that Vite’s native HMR can work correctly.

### 5.3 What does not need HMR

- The **production-like IIFE/UMD bundle** (`sdk.global.js`) is not expected to support full HMR.
- It’s acceptable if using the IIFE build for testing causes full page reloads instead of HMR. However, for `yarn dev`, the primary development path should use ESM imports with proper HMR.

---

## 6. Test Application

A minimal test application must be included, e.g. in `/test-app`.

### 6.1 Purpose

- To manually verify that the SDK works via:
  - Script-tag usage (for example pointing to the dev or build output, if convenient).
  - ESM import usage.
- To provide a playground where editing Vue components, styles, and SDK logic is reflected live via `yarn dev`.

### 6.2 Behavior

When `yarn dev` is run:

- Visiting the dev server URL (e.g. `http://localhost:5173`) should show a simple page containing:
  - A container element for the chat widget.
  - Example usage of the SDK:
    - Either via `import MyChatSDK from 'my-sdk'` and `MyChatSDK.create(...)`.
    - Or/and via a script tag loading the dev build.
- The page should demonstrate that the widget mounts successfully and displays:
  - Message list
  - Input field
  - Send button

Again, no backend integration is required — clicking “send” can just append a fake message to the message list.

### 6.3 Build vs dev

- `yarn dev`:
  - Runs the dev server for the test app.
  - Uses SDK from source (ESM) with HMR.
- `yarn build`:
  - Builds only the SDK bundles.
  - The test app does **not** need to be built for production.

---

## 7. Additional Notes & Constraints

- Keep the code clean, modular, and easy to extend.
- Make sure the SDK can, in the future, support multiple widget instances on the same page (the current version may only demonstrate a single instance, but the design should not prevent multiple).
- Make sure the Shadow DOM is used consistently so that the widget’s styles do not leak into the host page and vice versa.
- Avoid polluting the global namespace beyond the single SDK global (e.g. `window.MyChatSDK`).

---

## 8. Questions for the Implementer

If anything is unclear or if trade-offs must be made, please clarify the following:

1. Do you prefer to keep the suggested directory structure, or do you propose a better layout for Vite + Vue + SDK?  
2. Should the SDK’s global name (`MyChatSDK`) be configurable (via build config or environment variable), or is a fixed name acceptable?  
3. Should the script-tag configuration be extended to include more options (e.g. theme, colors, position) now, or should we keep it minimal for this first version?  
4. Are you comfortable generating TypeScript declaration files for the SDK API, or should we skip that in the initial implementation?  

The main priorities are: **simple one-line usage, Vue 3 + Shadow DOM isolation, Vite-based build, HMR in development, and minimal dependencies.**
