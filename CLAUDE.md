# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the nats.io website, a static site built with Hugo (v0.80.0 extended). The site provides information about NATS messaging system including documentation links, downloads, blog posts, and community resources.

## Development Commands

### Local Development
```bash
# Install dependencies
make setup  # Installs npm dependencies and Hugo via brew

# Run development server with drafts and future posts
make develop
# or directly:
hugo server --buildDrafts --buildFuture
```

The development server runs with live reload and builds draft/future content for preview.

### Production Build
```bash
# Build for production (used by Netlify)
make netlify-production-build
# or directly:
hugo --minify
```

### Preview Build
```bash
# Build preview with custom base URL (used by Netlify for PRs)
make netlify-preview-build
```

### Using Local Hugo Binary
A Hugo extended binary (v0.80.0) is already present in the repo root:
```bash
./hugo server --buildDrafts --buildFuture
./hugo version
```

## Site Architecture

### Content Structure
- **content/**: Markdown content files organized by section
  - `blog/`: Blog posts with front matter (date, author, categories, tags)
  - `download/`: Download pages for clients and servers
  - `about.md`: About page
- **data/**: Structured data files (YAML/TOML) for dynamic content
  - `clients.yaml`: NATS client library information
  - `servers.yaml`: Server release information
  - `companies.toml`: Companies using NATS
  - `partners.toml`, `ambassadors.toml`, `events.toml`, `resources.yaml`, etc.
- **layouts/**: Hugo templates (HTML with Go templating)
  - `_default/`: Default templates and base layout
  - `partials/`: Reusable template components
  - `shortcodes/`: Custom shortcodes for content (clients, companies, newsletters, etc.)
  - `blog/`, `download/`: Section-specific templates
- **static/**: Static assets (images, PDFs, etc.) copied directly to output
- **assets/**: Assets that are processed by Hugo (SCSS, JS)
- **backup/**: Old/archived layouts and content (not currently used)

### Configuration
- **config.toml**: Main Hugo configuration
  - Base URL, site metadata, taxonomies
  - Menu structure
  - Social links, logos, fonts
  - GitHub edit base URL: `https://github.com/nats-io/nats-site/edit/main/content`
- **netlify.toml**: Netlify deployment configuration
  - Hugo version: 0.80.0
  - Build commands for production/preview

### Theme & Styling
Uses Bulma CSS framework (installed via npm) with custom styling. No separate theme directory - layouts are directly in the repository.

### Data-Driven Components
The site uses Hugo's data files to populate dynamic sections:
- Client libraries: `data/clients.yaml` → rendered via shortcodes and partials
- Server downloads: `data/servers.yaml` → download pages
- Companies/partners/ambassadors: respective TOML files → homepage and about sections
- Events and resources: `data/events.toml`, `data/resources.yaml`

### Content Rendering
- Uses Goldmark for markdown rendering (with unsafe HTML enabled in config)
- Syntax highlighting via Pygments (native style)
- Custom shortcodes available: `{{< clients >}}`, `{{< companies >}}`, `{{< servers >}}`, `{{< newsletter >}}`, etc.
- Custom link rendering via `layouts/_default/_markup/render-link.html`

## Working with Content

### Creating Blog Posts
Use the blog archetype:
```bash
hugo new blog/my-post-title.md
```

Blog posts require front matter: title, date, author, categories, tags.

### Editing Data Files
To update client libraries, server versions, companies, etc., edit the corresponding YAML/TOML files in `data/`. Changes will automatically reflect in the rendered site.

### Hugo Version Requirement
This site requires Hugo Extended v0.80.0 (specified in netlify.toml). The extended version is needed for Sass/SCSS processing if applicable.
