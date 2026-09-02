/**
 * The languages table.
 *
 * Same manifest as the demo, rendered as a filterable list. Every column —
 * forms, options, default currency, range, bundle size — is read from the
 * library's own exports, so this page can't claim support the code doesn't
 * have.
 */

import { FORMS, escapeHtml, formatBytes, loadManifest, markCurrentPage } from './app.js'

const rows = document.querySelector('#rows')
const search = document.querySelector('#search')
const formFilter = document.querySelector('#form-filter')
const count = document.querySelector('#count')

let variants = []

/**
 * Everything a filter query should match against, lowercased once per row.
 *
 * @param {object} item Manifest variant entry
 * @returns {string} Haystack
 */
function haystack(item) {
  const currencies = Object.values(item.forms)
    .flatMap(form => form.options.filter(option => option.name === 'currency'))
    .flatMap(option => option.values ?? [])
  return [item.code, item.name, item.native, item.entry, item.defaultCurrency, ...currencies]
    .filter(Boolean).join(' ').toLowerCase()
}

/**
 * @param {object} item Manifest variant entry
 * @returns {string} One table row
 */
function renderRow(item) {
  const optionNames = [...new Set(
    Object.values(item.forms).flatMap(form => form.options.map(option => option.name)),
  )]
  // Every form of a language shares its ceiling in almost every case; where
  // they differ, the largest is the honest headline and the demo shows the
  // per-form number. Ceilings are compared by digit count, not by their
  // labels — "10^9" sorts above "10^66" as a string.
  const forms = Object.values(item.forms)
  const range = forms.some(form => form.max === null)
    ? 'unbounded'
    : forms.reduce((a, b) => (b.max.length > a.max.length ? b : a)).maxLabel

  return `
    <tr>
      <td class="name">
        ${escapeHtml(item.name)}
        ${item.native !== item.name ? `<span class="native" dir="auto">${escapeHtml(item.native)}</span>` : ''}
      </td>
      <td class="code"><a href="./#${escapeHtml(item.code)}/cardinal/1234">${escapeHtml(item.entry)}</a></td>
      <td>
        <span class="forms">${FORMS.map(form =>
          `<span class="${item.forms[form] ? 'on' : ''}" title="${form}">${form.slice(0, 3)}</span>`).join('')}</span>
      </td>
      <td class="options">${optionNames.length > 0 ? escapeHtml(optionNames.join(', ')) : '—'}</td>
      <td>${item.defaultCurrency ? escapeHtml(item.defaultCurrency) : '—'}</td>
      <td>${escapeHtml(range)}</td>
      <td class="num">${item.bundle ? formatBytes(item.bundle.gzip) : '—'}</td>
    </tr>
  `
}

function apply() {
  const query = search.value.trim().toLowerCase()
  const filter = formFilter.value

  const matches = variants.filter((item) => {
    if (query && !item.haystack.includes(query)) return false
    if (filter === 'options') return Object.values(item.forms).some(form => form.options.length > 0)
    if (filter) return Boolean(item.forms[filter])
    return true
  })

  rows.innerHTML = matches.map(renderRow).join('')
  count.textContent = `${matches.length} of ${variants.length} variants`
}

async function init() {
  markCurrentPage()
  const manifest = await loadManifest()
  document.querySelector('#version').textContent = `v${manifest.version}`

  variants = manifest.variants
    .map(item => ({ ...item, haystack: haystack(item) }))
    .sort((a, b) => a.name.localeCompare(b.name))

  apply()
  search.addEventListener('input', apply)
  formFilter.addEventListener('change', apply)
}

init().catch((error) => {
  rows.innerHTML = `<tr><td colspan="7">Could not load the language list: ${escapeHtml(error.message)}</td></tr>`
})
