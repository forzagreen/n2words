/**
 * The languages index.
 *
 * One row per LANGUAGE, not per variant: n2words supports 50 languages, and
 * the 72 regional/script variants are a refinement inside them. A row's
 * headline identifier is the code you import — the bare tag where the language
 * has one — and its regions live in an expansion, grouped by the spelling they
 * actually produce rather than listed flat.
 *
 * Every column is read from the generated manifest, so this page cannot claim
 * support the library doesn't have.
 */

import { FORMS, escapeHtml, formatBytes, initTheme, loadManifest, markCurrentPage } from './app.js'

const rows = document.querySelector('#rows')
const search = document.querySelector('#search')
const kindFilter = document.querySelector('#kind-filter')
const count = document.querySelector('#count')

let manifest
let families = []
let variantsByCode = new Map()

/**
 * Everything a filter query should match for one language: its own names, plus
 * every region code, region name and currency underneath it — so typing
 * "Kenya", "en-ZA" or "AUD" finds English.
 *
 * @param {object} family A manifest family entry
 * @returns {string} Lowercased haystack
 */
function haystack(family) {
  const members = family.variants.map(code => variantsByCode.get(code))
  return [
    family.primary, family.name, family.native, family.entry,
    ...members.flatMap(member => [member.code, member.name, member.native, member.defaultCurrency]),
    ...family.currencies,
  ].filter(Boolean).join(' ').toLowerCase()
}

/**
 * The largest ceiling among a variant's forms, compared by digit count rather
 * than by label — "10^9" sorts above "10^66" as a string.
 *
 * @param {object} variant A manifest variant entry
 * @returns {string} Range label
 */
function rangeOf(variant) {
  const forms = Object.values(variant.forms)
  if (forms.some(form => form.max === null)) return 'unbounded'
  return forms.reduce((a, b) => (b.max.length > a.max.length ? b : a)).maxLabel
}

/**
 * The regions expansion: every variant of a language, grouped by measured
 * spelling. A group heading carries a worked example of that spelling, so the
 * difference is shown rather than asserted; inside a group, a variant that
 * merely clones another's words says so and leaves only its currency.
 *
 * @param {object} family A manifest family entry
 * @returns {string} Table cell markup
 */
function renderRegions(family) {
  const groups = family.spellings.map((group) => {
    const sample = family.sample?.texts[group.representative]
    const tied = family.sample?.tied?.[group.representative]
    const heading = family.spellings.length === 1
      ? ''
      : `<p class="rg-head">Spells like <code>${escapeHtml(group.representative)}</code>`
        + (sample
          ? `<span class="rg-sample">${escapeHtml(family.sample.value)} → &ldquo;${escapeHtml(sample)}&rdquo;`
          + `${tied ? ' — differs from its twin in another form' : ''}</span>`
          : '')
        + `</p>`

    const members = group.codes.map((code) => {
      const member = variantsByCode.get(code)
      const notes = [
        member.variantOf ? `same words as ${escapeHtml(member.variantOf)}` : '',
        code === family.default ? `what <code>${escapeHtml(family.entry)}</code> resolves to` : '',
      ].filter(Boolean).join(' · ')
      return `
        <li>
          <a href="./#${escapeHtml(code)}/cardinal/1234"><code>${escapeHtml(code)}</code></a>
          <span class="rg-name">${escapeHtml(member.name)}</span>
          <span class="rg-cur">${escapeHtml(member.defaultCurrency ?? '—')}</span>
          <span class="rg-note">${notes}</span>
        </li>`
    }).join('')

    return `${heading}<ul class="rg-list">${members}</ul>`
  }).join('')

  return `<div class="regions">${groups}
    <p class="rg-foot">Any ${escapeHtml(family.name)} entry point can name any of its
      ${family.currencies.length} currenc${family.currencies.length === 1 ? 'y' : 'ies'} via
      <code>{ currency }</code>. The column above is only which one each region defaults to.</p>
  </div>`
}

/**
 * @param {object} family A manifest family entry
 * @returns {string} Two table rows: the language, and its (hidden) regions
 */
function renderRow(family) {
  const landing = variantsByCode.get(family.landing)
  const expandable = family.variants.length > 1
  const id = `regions-${family.primary}`

  const spellings = family.variants.length === 1
    ? '<span class="quiet">1 region</span>'
    : `${family.variants.length} regions · <strong>${family.spellings.length} spelling${family.spellings.length === 1 ? '' : 's'}</strong>`

  const missing = FORMS.filter(form => !landing.forms[form])
  const importCell = family.entry
    ? `<code>n2words/${escapeHtml(family.entry)}</code>`
    : `<code>n2words/${escapeHtml(family.landing)}</code><span class="tag">no bare tag</span>`

  return `
    <tr class="family" id="${escapeHtml(family.primary)}">
      <td class="name">
        ${expandable
          ? `<button type="button" class="expand" aria-expanded="false" aria-controls="${id}">
               <span class="caret" aria-hidden="true">▸</span>${escapeHtml(family.name)}</button>`
          : `<span class="no-expand">${escapeHtml(family.name)}</span>`}
        ${family.native !== family.name ? `<bdi class="native">${escapeHtml(family.native)}</bdi>` : ''}
      </td>
      <td class="code">${importCell}${missing.length > 0 ? `<span class="tag">no ${escapeHtml(missing.join('/'))}</span>` : ''}</td>
      <td class="spellings">${spellings}</td>
      <td class="num">${family.currencies.length}</td>
      <td>${escapeHtml(rangeOf(landing))}</td>
      <td class="num">${family.bundle ? formatBytes(family.bundle.gzip) : '—'}</td>
    </tr>
    <tr class="regions-row" id="${id}" hidden><td colspan="6">${renderRegions(family)}</td></tr>`
}

function apply() {
  const query = search.value.trim().toLowerCase()
  const kind = kindFilter.value

  const matches = families.filter((family) => {
    if (query && !family.haystack.includes(query)) return false
    if (kind === 'spellings') return family.spellings.length > 1
    if (kind === 'regions') return family.variants.length > 1
    if (kind === 'no-alias') return family.entry === null
    if (kind === 'options') {
      const landing = variantsByCode.get(family.landing)
      // `currency` is declared by every currency form, so counting it would
      // match all 50 languages and filter nothing. What the reader means by
      // "has options" is a knob this language has and others don't — the same
      // set the demo's options panel shows, which excludes currency because it
      // has its own control there.
      return Object.values(landing.forms).some(form => form.options.some(option => option.name !== 'currency'))
    }
    return true
  })

  rows.innerHTML = matches.map(renderRow).join('')

  // A search that matched something inside a language opens it, so the reader
  // sees the region they typed rather than a row that merely might contain it.
  if (query) {
    for (const button of rows.querySelectorAll('.expand')) toggle(button, true)
  }

  const regions = matches.reduce((total, family) => total + family.variants.length, 0)
  count.textContent = `${matches.length} of ${families.length} languages · ${regions} regions`
}

/**
 * @param {HTMLButtonElement} button The expand button
 * @param {boolean} open Whether the regions should be shown
 */
function toggle(button, open) {
  button.setAttribute('aria-expanded', String(open))
  button.querySelector('.caret').textContent = open ? '▾' : '▸'
  document.querySelector(`#${CSS.escape(button.getAttribute('aria-controls'))}`).hidden = !open
}

async function init() {
  markCurrentPage()
  initTheme()
  manifest = await loadManifest()
  document.querySelector('#version').textContent = `v${manifest.version}`

  variantsByCode = new Map(manifest.variants.map(variant => [variant.code, variant]))
  families = manifest.families.map(family => ({ ...family, haystack: haystack(family) }))

  apply()
  search.addEventListener('input', apply)
  kindFilter.addEventListener('change', apply)

  rows.addEventListener('click', (event) => {
    const button = event.target.closest('.expand')
    if (button) toggle(button, button.getAttribute('aria-expanded') !== 'true')
  })

  // languages.html#en-KE opens English and scrolls to it, so deep links from
  // LANGUAGES.md and from the demo keep landing. A row's own id is its
  // language (`#en`) — the browser's native fragment jump ran against an empty
  // tbody long before `apply()` filled it — so both spellings resolve here.
  const target = location.hash.slice(1)
  const primary = variantsByCode.get(target)?.primary
    ?? (families.some(family => family.primary === target) ? target : null)
  if (primary) {
    const button = rows.querySelector(`#${CSS.escape(primary)} .expand`)
    if (button) toggle(button, true)
    document.querySelector(`#${CSS.escape(primary)}`)?.scrollIntoView({ block: 'center' })
  }
}

init().catch((error) => {
  rows.innerHTML = `<tr><td colspan="6">Could not load the language list: ${escapeHtml(error.message)}</td></tr>`
})
