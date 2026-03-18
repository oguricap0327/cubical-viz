# Cubical Type Theory Visualizer

Interactive 3D visualization of cubical type theory concepts using Svelte and Three.js.

## About

This project aims to provide an interactive way to understand cubical type theory through 3D visualizations. Based on the paper ["Cubical Type Theory: a constructive interpretation of the univalence axiom"](https://arxiv.org/pdf/1611.02108) and the [Cubical Agda](https://agda.readthedocs.io/en/latest/language/cubical.html) implementation.

## Features (Planned)

- Visualize the interval type I with endpoints i0 and i1
- Interactive path types as functions I → A
- Squares, cubes, and higher-dimensional cubes
- Transport and composition operations
- Glue types and univalence
- Examples from the paper

## Development

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Deployment

This project is configured to automatically deploy to GitHub Pages when pushed to the `main` branch.

### Setup GitHub Pages

1. Create a new repository on GitHub (e.g., `cubical-viz`)
2. Push this code to the repository
3. Go to repository Settings → Pages
4. Under "Build and deployment", select "GitHub Actions" as the source
5. The site will be available at `https://yourusername.github.io/cubical-viz/`

### Manual Deployment

```bash
# Build the project
bun run build

# The dist/ folder contains the static site ready for deployment
```

## Tech Stack

- **Svelte 5**: Reactive UI framework
- **Three.js**: 3D graphics library
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety
- **Bun**: Fast JavaScript runtime and package manager

## References

- [Cubical Type Theory Paper](https://arxiv.org/pdf/1611.02108)
- [Cubical Agda Documentation](https://agda.readthedocs.io/en/latest/language/cubical.html)
- [agda/cubical Library](https://github.com/agda/cubical)
- [1lab](https://1lab.dev/)

## License

MIT
