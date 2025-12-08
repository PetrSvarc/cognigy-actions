# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## Deployment to GitHub Pages

This project is configured for GitHub Pages deployment with two methods:

### Automatic Deployment (Recommended)

The project includes a GitHub Actions workflow that automatically deploys to GitHub Pages when you push to the `main` or `master` branch.

**Setup Steps:**

1. Push your code to GitHub
2. Go to your repository Settings → Pages
3. Under "Source", select "GitHub Actions"
4. The workflow will automatically run on the next push to `main`/`master`

The site will be available at: `https://[your-username].github.io/cognigy-actions/`

**Note:** If your repository name is different from `cognigy-actions`, update the `base` path in `vite.config.ts` to match your repository name.

### Manual Deployment

You can also deploy manually using the `gh-pages` package:

1. Install dependencies (if not already done):
   ```bash
   npm install
   ```

2. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

This will build the project and push the `dist` folder to the `gh-pages` branch.

### Build Scripts

- `npm run build` - Build for production (development base path `/`)
- `npm run build:gh-pages` - Build for GitHub Pages (with `/cognigy-actions/` base path)
- `npm run deploy` - Build and deploy to GitHub Pages

### Important Notes

- Make sure to update the `base` path in `vite.config.ts` if your repository name is different
- The GitHub Actions workflow uses the repository name from the checkout action, so the base path is set via the `GITHUB_PAGES` environment variable
