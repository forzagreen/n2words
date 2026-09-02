/**
 * GitHub Pages Site Builder
 *
 * Assembles the deployable site into `_site/`:
 *
 *   site/**            -> _site/**          (hand-written pages, styles, script)
 *   dist/**            -> _site/dist/**     (the real built bundles)
 *   generate-site-data -> _site/languages.json
 *
 * The demo imports `./dist/{code}/{form}.js` at runtime, so the page runs the
 * same artifacts npm and jsDelivr serve, built from the same commit — the demo
 * can't drift from the library it advertises, and there is nothing to keep in
 * sync by hand.
 *
 * Usage:
 *   node --run build        # produces dist/ (prerequisite)
 *   node --run site:build
 */

import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const OUT = '_site'

if (!existsSync('dist')) {
  throw new Error('dist/ not found — run `node --run build` first (the demo loads the real bundles).')
}

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

cpSync('site', OUT, { recursive: true })
cpSync('dist', `${OUT}/dist`, { recursive: true })

execFileSync(process.execPath, ['scripts/generate-site-data.js', `${OUT}/languages.json`], { stdio: 'inherit' })

console.log(`✓ Built ${OUT}/ — serve it with \`node --run site:serve\``)
