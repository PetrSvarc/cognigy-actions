# CXone Chat

One-liner webchat initialization script for CXone applications.

## Usage

```html
<script src="https://cdn.example.com/cxone-chat.min.js"></script>
<script>
  CXOneChat.init({ context: 'actions' });
</script>
```

That's it! The script handles everything:
- Loading Cognigy Webchat from CDN
- Auto-detecting user ID from localStorage/cookies
- Syncing conversations to backend
- CXone theming and styling

## Configuration

```javascript
CXOneChat.init({
  context: 'actions',  // Required: app context ('actions', 'dashboard', etc.)
  userId: 'user-123'   // Optional: auto-detected if not provided
});
```

## API

```javascript
// Initialize
const chat = await CXOneChat.init({ context: 'actions' });

// Or use global methods after init
CXOneChat.open();
CXOneChat.close();
CXOneChat.toggle();
CXOneChat.sendMessage('Hello');
CXOneChat.getUserId();
CXOneChat.isInitialized();
```

## User ID Auto-Detection

If `userId` is not provided, the script tries to detect it from:

1. `localStorage.getItem('cxone-user-id')`
2. Common auth keys: `userId`, `user_id`, `uid`, `sub`, `user`
3. JSON auth objects: `auth`, `user`, `session`, `currentUser`
4. Cookies: `userId`, `user_id`, `uid`
5. Generates new UUID if nothing found

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Build with watch
npm run build:watch

# Serve test page
npm run serve
```

## Build Output

| File | Size | Description |
|------|------|-------------|
| `dist/cxone-chat.js` | ~16KB | Development build |
| `dist/cxone-chat.min.js` | ~6KB | Production build |

## License

MIT
