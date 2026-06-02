# jbrowse-plugin-template

Template for creating JBrowse 2 plugins using rollup and pnpm.

## Setup

Via GitHub CLI:

```console
gh repo create jbrowse-plugin-my-project --template GMOD/jbrowse-plugin-template
cd jbrowse-plugin-my-project
pnpm install
```

Or clone manually:

```console
git clone https://github.com/GMOD/jbrowse-plugin-template.git jbrowse-plugin-my-project
cd jbrowse-plugin-my-project
rm -rf .git && git init
pnpm install
```

### Renaming the plugin

The plugin name appears in several places that must all stay in sync:

| File | What to change |
|---|---|
| `package.json` | `name` field |
| `rollup.config.mjs` | `name` in output and `outfile` names |
| `src/index.ts` | class name and `name` field |
| `config.json` | plugin `name` and `url` |

## Development

```console
pnpm dev  # rollup watch + static file server on port 9000 (runs both in parallel)
```

Or run separately: `pnpm start` (rollup watch) and `pnpm serve` (file server).

Point JBrowse Web at: `http://localhost:3000/?config=http://localhost:9000/config.json`

## Build

```console
pnpm build  # tsc + rollup UMD bundle → dist/
```

## Testing

```console
pnpm test       # unit tests (jsdom + React Testing Library)
pnpm test:e2e   # puppeteer against nightly JBrowse (downloads on first run)
```

## Deployment

There are many ways to deploy — some options:

- **npm** — remove `"private": true` from `package.json` and `pnpm publish` (consider [npm trusted publishing](https://docs.npmjs.com/generating-provenance-statements)); reference via unpkg:
  ```json
  { "plugins": [{ "name": "MyPlugin", "url": "https://unpkg.com/jbrowse-plugin-my-project/dist/jbrowse-plugin-my-project.umd.production.min.js" }] }
  ```
- **Copy the bundle** — run `pnpm build` and place the `.umd.production.min.js` anywhere your JBrowse instance can reach, then reference it by URL in `config.json`.
- **Skip publishing** — for internal use, just serve the bundle locally and point your JBrowse config at it.

## Shared packages (re-exports)

JBrowse exposes a set of packages — React, MUI, mobx, mobx-state-tree, and others — on `window.JBrowseExports` at runtime. Plugins **must** use these shared instances rather than bundling their own copies; a second copy of React (for example) causes hook errors and broken state.

The rollup config handles this automatically via `externalGlobals`: any import from a package in `@jbrowse/core/ReExports/list` is replaced with a `JBrowseExports["package-name"]` lookup at build time. You import these packages normally in TypeScript — no special syntax required:

```typescript
import { observer } from 'mobx-react'   // → JBrowseExports["mobx-react"]
import { types } from 'mobx-state-tree' // → JBrowseExports["mobx-state-tree"]
```

To see the full list of available packages: `node -e "console.log(require('@jbrowse/core/ReExports/list').default)"` (or inspect the source in `node_modules/@jbrowse/core/ReExports/list.js`).

If you need to access another loaded plugin from your plugin, use `pluginManager.getPlugin('PluginName')` inside `install()` or `configure()`.

## Using CSS from dependencies

The rollup build does not have a CSS loader. If a dependency (e.g. Mol* / molstar) requires CSS, inject it at runtime with a small helper instead of importing the `.css` file directly:

```typescript
function injectCSS(css: string) {
  const style = document.createElement('style')
  style.appendChild(document.createTextNode(css))
  document.head.appendChild(style)
}

// then call it with the raw CSS string, e.g. pulled in via a bundler plugin
// or copied inline
injectCSS(`.my-class { color: red }`)
```

This avoids needing a specialized CSS loader in either rollup or esbuild.

## Embedded components

To use this plugin with `@jbrowse/react-linear-genome-view`, install it from npm and pass it via `plugins`:

```typescript
import { createViewState, JBrowseLinearGenomeView } from '@jbrowse/react-linear-genome-view'
import MyPlugin from 'jbrowse-plugin-my-project'

const state = createViewState({
  assembly: { /* ... */ },
  plugins: [MyPlugin],
  tracks: [ /* ... */ ],
  location: 'chr1:1-100000',
})
```

See https://jbrowse.org/storybook/lgv/main/?path=/docs/using-plugins--docs for a live example.

---

See [jbrowse-plugin-esbuild-template](https://github.com/GMOD/jbrowse-plugin-esbuild-template) for an alternative using esbuild instead of rollup.
