# Deployment Guide

## GitHub Pages Setup

### 1. Create GitHub Repository

```bash
cd ~/.openclaw/workspace/files/projects/cubical-viz
git init
git add .
git commit -m "Initial commit: Cubical Type Theory Visualizer"
```

Create a new repository on GitHub (e.g., `cubical-viz`), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/cubical-viz.git
git branch -M main
git push -u origin main
```

### 2. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: **GitHub Actions**
4. Push any commit to trigger the deployment

The site will be available at: `https://YOUR_USERNAME.github.io/cubical-viz/`

### 3. Update Base Path (if needed)

If your repository name is different from `cubical-viz`, update `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [svelte()],
  base: '/YOUR_REPO_NAME/', // Change this
  build: {
    outDir: 'dist'
  }
})
```

## Local Development

```bash
# Start dev server (hot reload enabled)
bun run dev

# Build for production
bun run build

# Preview production build locally
bun run preview
```

## Project Structure

```
cubical-viz/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── src/
│   ├── App.svelte             # Main Svelte component
│   ├── main.ts                # Entry point
│   └── app.css                # Global styles
├── index.html                 # HTML template
├── vite.config.ts             # Vite configuration
├── svelte.config.js           # Svelte configuration
├── package.json               # Dependencies and scripts
└── README.md                  # Project documentation
```

## Next Steps

1. **Initialize Git repository** and push to GitHub
2. **Enable GitHub Pages** in repository settings
3. **Start developing** the visualizations!

The basic Three.js scene is already set up with a rotating cube. You can now start implementing cubical type theory visualizations.
