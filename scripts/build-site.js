/**
 * GitHub Pages Site Builder
 *
 * Assembles the deployable site into `_site/`:
 *
 *   site/**            -> _site/**          (hand-written pages, styles, script)
 *   dist/**            -> _site/dist/**     (the real built bundles, minus UMD)
 *   generate-site-data -> _site/languages.json
 *
 * The demo imports `./dist/{code}/{form}.js` at runtime, so the page runs the
 * same artifacts npm and jsDelivr serve, built from the same commit — the demo
 * can't drift from the library it advertises, and there is nothing to keep in
 * sync by hand.
 *
 * Assembly happens in a staging directory that replaces `_site/` only once
 * every step has succeeded. A half-built tree is indistinguishable from a
 * complete one once it is being served — pages load, `languages.json` 404s,
 * and every table is empty — so a failed build must leave no new tree at all.
 *
 * Usage:
 *   node --run build        # produces dist/ (prerequisite)
 *   node --run site:build
 */

import { cpSync, existsSync, mkdirSync, renameSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const OUT = '_site'
const STAGE = '_site.tmp'

if (!existsSync('dist')) {
  throw new Error('dist/ not found — run `node --run build` first (the demo loads the real bundles).')
}

rmSync(STAGE, { recursive: true, force: true })
mkdirSync(STAGE, { recursive: true })

try {
  cpSync('site', STAGE, { recursive: true })
  // UMD builds are excluded: nothing on the site loads one. The demo imports
  // `dist/{code}/{form}.js`, and the single UMD mention in site/ is a jsDelivr
  // snippet in docs.html — a code sample pointing at the CDN, not a fetch.
  // Copying all 118 would add ~1.3 MB to the Pages artifact for no request.
  cpSync('dist', `${STAGE}/dist`, { recursive: true, filter: source => !source.endsWith('.umd.js') })

  execFileSync(process.execPath, ['scripts/generate-site-data.js', `${STAGE}/languages.json`], { stdio: 'inherit' })

  rmSync(OUT, { recursive: true, force: true })
  renameSync(STAGE, OUT)
}
catch (error) {
  rmSync(STAGE, { recursive: true, force: true })
  throw error
}

console.log(`✓ Built ${OUT}/ — serve it with \`node --run site:serve\``)
