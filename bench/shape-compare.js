/**
 * Compares the shipped cost of three currency/form shapes.
 *
 * Builds the same entry points from three trees and reports what a consumer
 * actually downloads. Everything below is measured, not asserted — run it
 * yourself and the numbers should reproduce exactly.
 *
 *   node bench/shape-compare.js
 *
 * Trees compared (created as throwaway git worktrees, removed afterwards):
 *   main    — the current release shape, one file per language
 *   #428    — feat/currency-matrix-bare-tags, shared matrix + variantOf
 *   branch  — this branch, per-form modules + per-language named exports
 */

import { rollup } from 'rollup'
import terser from '@rollup/plugin-terser'
import virtual from '@rollup/plugin-virtual'
import { execSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const PR_REF = 'origin/feat/currency-matrix-bare-tags'

// Same terser settings rollup.config.js uses for individual language bundles,
// so these numbers are comparable to what actually ships in dist/.
const minify = terser({
  compress: { passes: 3, ecma: 2020, pure_getters: true, toplevel: true },
  mangle: { toplevel: true },
  format: { comments: /^!/, ecma: 2020 },
})

/**
 * Bundles an entry and returns its minified source.
 * @param {string} entry - Module source to use as the entry point
 * @returns {Promise<string>} The minified bundle
 */
async function build(entry) {
  const bundle = await rollup({ input: 'entry', plugins: [virtual({ entry }), minify], logLevel: 'silent' })
  const { output } = await bundle.generate({ format: 'es' })
  await bundle.close()
  return output[0].code
}

/**
 * @param {string} file - Absolute path to a module
 * @param {string} names - Named exports to pull through
 * @returns {Promise<string>} The minified bundle
 */
const bundleOf = (file, names) => build(`export { ${names} } from ${JSON.stringify(file)}`)

// Currency nouns that appear in English vocabulary. Grepping string literals is
// valid on a minified bundle: terser mangles identifiers, never string content.
const CURRENCY_WORDS = ['dollar', 'cent', 'pound', 'penny', 'rand', 'cedi', 'ringgit',
  'naira', 'peso', 'shilling', 'yen', 'euro', 'rupee', 'taka', 'dinar', 'dirham']

/**
 * @param {string} code - A built bundle
 * @returns {string[]} Currency words present as string literals
 */
const wordsIn = code => CURRENCY_WORDS.filter(w => code.includes(`"${w}"`) || code.includes(`'${w}'`))

const tmp = mkdtempSync(join(tmpdir(), 'n2words-shape-'))
const worktrees = []

/**
 * @param {string} ref - Git ref to check out
 * @param {string} name - Directory name for the worktree
 * @returns {string} Absolute path to the worktree
 */
function worktree(ref, name) {
  const path = join(tmp, name)
  execSync(`git worktree add -q --detach ${JSON.stringify(path)} ${ref}`, { stdio: 'pipe' })
  worktrees.push(path)
  return path
}

try {
  const main = worktree('origin/main', 'main')
  const pr = worktree(PR_REF, 'pr428')

  const ALL = 'toCardinal, toOrdinal, toCurrency'

  // The case this is all about: a page that spells prices. One language, one
  // currency, one form. It fetches a prebuilt file from a CDN, so whatever the
  // file contains is what it downloads — there is no bundler to prune it.
  const mainDist = await bundleOf(join(main, 'src/en-US.js'), ALL)
  const prDist = await bundleOf(join(pr, 'src/en-US.js'), ALL)
  const ourCur = await bundleOf(resolve('src/en-US/toCurrency.js'), 'toCurrency')

  console.log('\nA page that spells amounts in one currency — what it downloads:\n')
  console.log(`  main   dist/en-US.js          ${String(mainDist.length).padStart(6)} B`)
  console.log(`  #428   dist/en-US.js          ${String(prDist.length).padStart(6)} B`)
  console.log(`  branch dist/en-US/toCurrency.js  ${String(ourCur.length).padStart(6)} B`
    + `   ${Math.round(100 - 100 * ourCur.length / prDist.length)}% under #428`)
  console.log('\n  main and #428 ship all three forms because the file is one file.')
  console.log('  #428 additionally ships every currency in the language, not the one asked for:')
  console.log(`    #428   ${wordsIn(prDist).join(', ')}`)
  console.log(`    branch ${wordsIn(ourCur).join(', ')}`)

  // Opting into a second currency, on the shape that supports it as an export.
  const withGbp = await build(
    `import { toCurrency, GBP } from ${JSON.stringify(resolve('src/en-US/toCurrency.js'))}\n`
    + 'export const f = v => toCurrency(v, { currency: GBP })')
  console.log(`\n  branch, GBP opted in          ${String(withGbp.length).padStart(6)} B`
    + `   +${withGbp.length - ourCur.length} B for the one you asked for`)

  // Same story for the other forms.
  const mainCard = await bundleOf(join(main, 'src/en-US.js'), 'toCardinal')
  const prCard = await bundleOf(join(pr, 'src/en-US.js'), 'toCardinal')
  const ourCard = await bundleOf(resolve('src/en-US/toCardinal.js'), 'toCardinal')
  console.log('\nA page that only spells cardinals:\n')
  console.log(`  main   dist/en-US.js          ${String(mainDist.length).padStart(6)} B`)
  console.log(`  #428   dist/en-US.js          ${String(prDist.length).padStart(6)} B`)
  console.log(`  branch dist/en-US/toCardinal.js  ${String(ourCard.length).padStart(6)} B`)

  // The case per-form splitting is worst at, and the reason dist needs both
  // kinds of bundle. Three prebuilt files cannot share core.js, so it gets
  // inlined into each of them; one combined bundle shares it once.
  const ourOrd = await bundleOf(resolve('src/en-US/toOrdinal.js'), 'toOrdinal')
  const ourCombined = await build(
    `export { toCardinal } from ${JSON.stringify(resolve('src/en-US/toCardinal.js'))}\n`
    + `export { toOrdinal } from ${JSON.stringify(resolve('src/en-US/toOrdinal.js'))}\n`
    + `export { toCurrency } from ${JSON.stringify(resolve('src/en-US/toCurrency.js'))}`)
  const split = ourCard.length + ourOrd.length + ourCur.length
  console.log('\nA site that uses all three forms — the case splitting is worst at:\n')
  console.log(`  main   one file               ${String(mainDist.length).padStart(6)} B`)
  console.log(`  #428   one file               ${String(prDist.length).padStart(6)} B`)
  console.log(`  branch three fetches          ${String(split).padStart(6)} B   core.js inlined three times`)
  console.log(`  branch one combined bundle    ${String(ourCombined.length).padStart(6)} B`
    + `   +${ourCombined.length - mainDist.length} B vs main, ${ourCombined.length - prDist.length} B vs #428`)
  console.log('\n  So dist wants both kinds: per-form for focused consumers, combined for')
  console.log('  this one. With both shipped the split is never the worse choice.')

  // Secondary: an npm consumer has a bundler, so the picture is different and
  // worth stating honestly rather than leaving implied.
  const mainCur = await bundleOf(join(main, 'src/en-US.js'), 'toCurrency')
  const prCur = await bundleOf(join(pr, 'src/en-US.js'), 'toCurrency')
  console.log('\nFor comparison — npm, where a bundler can prune the source itself:\n')
  console.log(`  main   ${String(mainCur.length).padStart(6)} B     #428   ${String(prCur.length).padStart(6)} B     branch ${String(ourCur.length).padStart(6)} B`)
  console.log(`\n  Here main is the floor: the branch costs +${ourCur.length - mainCur.length} B for the guard and the`)
  console.log(`  currency option, #428 costs +${prCur.length - mainCur.length} B because the matrix comes along.`)
  console.log(`  Bundled cardinals are a wash (main ${mainCard.length}, #428 ${prCard.length}, branch ${ourCard.length}).`)

  // How much cross-language sharing the shared matrix actually achieves.
  const vocab = await import(join(pr, 'src/utils/currency-vocab.js'))
  const byForms = new Map()
  let entries = 0
  for (const [lang, row] of Object.entries(vocab)) {
    if (typeof row !== 'object' || row === null) continue
    for (const [iso, forms] of Object.entries(row)) {
      if (!forms?.major) continue
      entries++
      const key = JSON.stringify([forms.major, forms.minor])
      byForms.set(key, (byForms.get(key) ?? []).concat(`${lang}:${iso}`))
    }
  }
  const shared = [...byForms.values()].filter(v => new Set(v.map(s => s.split(':')[0])).size > 1)
  console.log('\nWhat centralising the vocabulary deduplicates:\n')
  console.log(`  ${entries} vocabulary entries across ${Object.keys(vocab).length} language rows`)
  console.log(`  ${shared.length} word-form values are shared by more than one language`)
  for (const v of shared) console.log(`    ${v.join(', ')}`)
  console.log()
}
finally {
  for (const path of worktrees) {
    try {
      execSync(`git worktree remove --force ${JSON.stringify(path)}`, { stdio: 'pipe' })
    }
    catch { /* worktree already gone */ }
  }
  rmSync(tmp, { recursive: true, force: true })
}
