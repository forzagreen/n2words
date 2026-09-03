/**
 * The live converter.
 *
 * The control model mirrors the library's own three axes, which the first
 * version of this page conflated into a single 72-item variant picker:
 *
 *   1. LANGUAGE  — chooses the words. The only required choice, named by its
 *                  bare tag (`en`, `ar`, `fr`), the documented entry point.
 *   2. REGION    — optional. Refines which spelling, and supplies a default
 *                  currency. Folded into a disclosure under the answer,
 *                  because 43 of the 50 languages have exactly one.
 *   3. CURRENCY  — exists only for the currency form, and is lifted out of the
 *                  generic options panel: `and` tunes one language's grammar,
 *                  while `currency` sits between a language (which currency
 *                  words it knows) and a country (which one it defaults to).
 *
 * Nothing here knows anything about a specific language: the picker, the
 * region list, the options panel and the code snippet are all rendered from
 * `languages.json`, generated from `src/` at deploy time.
 */

import {
  FORMS, convert, escapeHtml, formatBytes, formatOptions,
  initTheme, loadBundle, loadManifest, markCurrentPage, wireCopy,
} from './app.js'

/**
 * The default compare grid, named by LANGUAGE rather than by variant — a
 * spread of scripts and numbering systems.
 */
const COMPARE_SAMPLE = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ar', 'hi', 'zh', 'ja', 'ur']

const FORM_FUNCTION = { cardinal: 'toCardinal', ordinal: 'toOrdinal', currency: 'toCurrency' }

const $ = selector => document.querySelector(selector)

const elements = {
  value: $('#value'),
  language: $('#language'),
  currencyField: $('#currency-field'),
  currency: $('#currency'),
  currencyNote: $('#currency-note'),
  options: $('#options'),
  output: $('#output'),
  outputText: $('#output-text'),
  outputMeta: $('#output-meta'),
  locale: $('#locale'),
  localeSummary: $('#locale-summary'),
  localeBody: $('#locale-body'),
  snippet: $('#snippet'),
  snippetNote: $('#snippet-note'),
  compare: $('#compare'),
  compareToggle: $('#compare-toggle'),
}

const state = {
  manifest: null,
  variants: new Map(),
  families: new Map(),
  /** BCP 47 primary subtag — the language. */
  language: 'en',
  /** A variant code, or null for "no region: just the language". */
  region: null,
  form: 'cardinal',
  /** An explicit currency, or null to take the resolved variant's default. */
  currency: null,
  /** Everything except `currency`, which has its own control. */
  options: {},
  showAll: false,
  pendingOptions: null,
}

// ---------------------------------------------------------------- resolving

const family = () => state.families.get(state.language)

/** The variant actually converted with: the chosen region, or the landing one. */
const variant = () => state.variants.get(state.region ?? family().landing)

/** @returns {string} The reader's input, trimmed. */
const value = () => elements.value.value.trim()

/**
 * The import specifier for the current selection.
 *
 * A bare tag names a language and carries no default currency, so a currency
 * call that doesn't name one has to import the region-qualified code. That is
 * the library's own rule (docs/bare-tag-aliases.md), applied to whatever the
 * demo is doing rather than restated as prose.
 *
 * @returns {string} e.g. 'n2words/en' or 'n2words/en-US'
 */
function specifier() {
  if (state.region !== null) return `n2words/${state.region}`
  const borrowsRegionDefault = state.form === 'currency' && state.currency === null
  return `n2words/${borrowsRegionDefault ? variant().code : family().entry ?? family().landing}`
}

/** The options object the current call actually passes. */
function callOptions() {
  return state.form === 'currency' && state.currency !== null
    ? { ...state.options, currency: state.currency }
    : state.options
}

/**
 * The message to show for a thrown conversion. The library's failure modes are
 * deliberate and worth showing rather than hiding — a RangeError names the
 * ceiling it hit, a TypeError explains the bad option — so its own wording is
 * what the reader sees, tagged with the error name beside it.
 *
 * @param {unknown} error The thrown value
 * @returns {string} Message to display
 */
function describeError(error) {
  return error instanceof Error ? error.message : String(error)
}

// --------------------------------------------------------------- the picker

/**
 * Fill the language picker: one option per LANGUAGE, labelled with the code
 * you would import for it. That is the bare tag for 46 of them; the four whose
 * variants diverge in script or core numbering grammar (zh, pt, sr, am) have
 * none, so they show the variant a reader lands on, and the region disclosure
 * opens itself to say that the choice is real.
 */
function renderLanguages() {
  elements.language.innerHTML = state.manifest.families.map((item) => {
    const code = item.entry ?? item.landing
    const native = item.native !== item.name ? ` · ${item.native}` : ''
    return `<option value="${escapeHtml(item.primary)}">${escapeHtml(item.name)}${escapeHtml(native)} — ${escapeHtml(code)}</option>`
  }).join('')
  elements.language.value = state.language
}

/** Enable only the forms this language exports, falling back to one it does. */
function syncForms() {
  const available = variant().forms
  for (const form of FORMS) {
    document.querySelector(`#form-${form}`).disabled = available[form] === undefined
  }
  if (available[state.form] === undefined) state.form = Object.keys(available)[0]
  document.querySelector(`#form-${state.form}`).checked = true
}

// ------------------------------------------------------------- the currency

/**
 * The currency control — shown only for the currency form.
 *
 * One select, not two: the reader picks a currency, and the *consequence* of
 * that pick appears in the import below. Choose the region's own default and
 * the snippet imports the region; choose anything else and it imports the bare
 * tag with an explicit `{ currency }`. The rule is demonstrated by the code
 * that appears rather than explained in a paragraph.
 */
function renderCurrency() {
  const item = variant()
  const known = family().currencies
  const isCurrency = state.form === 'currency' && item.forms.currency !== undefined

  elements.currencyField.hidden = !isCurrency
  if (!isCurrency) return

  const fallback = item.defaultCurrency
  const selected = state.currency ?? fallback
  elements.currency.innerHTML = known.map((code) => {
    const name = state.manifest.currencies[code]
    const isDefault = code === fallback
    return `<option value="${escapeHtml(code)}"${code === selected ? ' selected' : ''}>`
      + `${escapeHtml(code)} — ${escapeHtml(name ?? code)}${isDefault ? ` (default of ${escapeHtml(item.code)})` : ''}</option>`
  }).join('')

  const usingDefault = state.currency === null || state.currency === fallback
  elements.currencyNote.innerHTML = usingDefault
    ? `A default currency belongs to a country, so this imports <code>${escapeHtml(item.code)}</code> to borrow ${escapeHtml(fallback)}.`
    + (family().entry ? ` <button type="button" class="linky" id="show-throw">See what <code>${escapeHtml(family().entry)}</code> throws</button>` : '')
    : `${escapeHtml(family().name)} knows currency words for ${known.length} currencies, so any entry point can name `
      + `${escapeHtml(state.currency)} explicitly — no country involved.`

  const throwButton = $('#show-throw')
  if (throwButton) throwButton.addEventListener('click', showBareTagThrow)
}

/**
 * Run the real bare-tag currency bundle with no options and show what it
 * throws. The message is the library's own, produced in the browser, so it
 * cannot drift from `src/{lang}.js`.
 */
async function showBareTagThrow() {
  const tag = family().entry
  try {
    const bundle = await loadBundle(tag, 'currency')
    bundle.toCurrency(value() || '1')
  }
  catch (error) {
    elements.output.dataset.state = 'teaching'
    elements.outputText.removeAttribute('dir')
    elements.outputText.textContent = describeError(error)
    elements.outputMeta.innerHTML = `<span class="badge">${escapeHtml(error?.name ?? 'Error')}</span>`
      + `<span>the rule, not a bug — name a currency or import a region</span>`
  }
}

// -------------------------------------------------------------- the options

/**
 * Render the options panel for the current variant and form, from the options
 * contract each form declares. `currency` is excluded — it has its own control.
 */
function renderOptions() {
  const options = (variant().forms[state.form]?.options ?? []).filter(option => option.name !== 'currency')

  elements.options.innerHTML = options.map((option) => {
    const id = `option-${option.name}`
    const label = `<label for="${id}">${escapeHtml(option.name)}</label>`
    const hint = `<p class="hint" id="${id}-hint">${escapeHtml(option.description)}</p>`

    if (option.values) {
      const items = option.values.map((item) => {
        const isDefault = String(item) === option.default
        return `<option value="${escapeHtml(item)}"${isDefault ? ' selected' : ''}>${escapeHtml(item)}${isDefault ? ' (default)' : ''}</option>`
      }).join('')
      return `<div class="option">${label}<select id="${id}" data-option="${escapeHtml(option.name)}" aria-describedby="${id}-hint">${items}</select>${hint}</div>`
    }

    if (option.type === 'boolean') {
      const checked = option.default === 'true' ? ' checked' : ''
      return `<div class="option"><input type="checkbox" id="${id}" data-option="${escapeHtml(option.name)}"${checked} aria-describedby="${id}-hint">${label}${hint}</div>`
    }

    return `<div class="option">${label}<input type="text" id="${id}" data-option="${escapeHtml(option.name)}" value="${escapeHtml(option.default ?? '')}" aria-describedby="${id}-hint">${hint}</div>`
  }).join('')

  readOptions()
}

/**
 * Collect the option controls into `state.options`, keeping only what the
 * reader changed, so the generated snippet shows the shortest call that
 * produces this output.
 */
function readOptions() {
  const declared = (variant().forms[state.form]?.options ?? []).filter(option => option.name !== 'currency')
  state.options = {}

  for (const option of declared) {
    const control = document.querySelector(`[data-option="${CSS.escape(option.name)}"]`)
    if (!control) continue
    const current = control.type === 'checkbox' ? control.checked : control.value
    if (String(current) !== option.default) state.options[option.name] = current
  }
}

// --------------------------------------------------------------- the region

/**
 * Render the region disclosure — the demoted axis.
 *
 * Regions are grouped by measured spelling rather than listed flat, so the
 * sixteen Englishes read as the four spellings they actually are, and the
 * eleven that differ only in their default currency say exactly that.
 */
function renderLocale() {
  const item = family()
  const spellings = item.spellings

  const summary = state.region === null
    ? `Using <code>${escapeHtml(item.entry ?? item.landing)}</code> — spells like <code>${escapeHtml(item.landing)}</code>`
    : `Using <code>${escapeHtml(state.region)}</code> — ${escapeHtml(state.variants.get(state.region).name)}`
  const count = item.variants.length === 1
    ? '1 region'
    : `${item.variants.length} regions · ${spellings.length} spelling${spellings.length === 1 ? '' : 's'}`

  elements.localeSummary.innerHTML = `<span class="locale-now">${summary}</span><span class="locale-count">${escapeHtml(count)}</span>`

  const radio = (code, label, detail, checked) => `
    <label class="loc${checked ? ' is-on' : ''}">
      <input type="radio" name="region" value="${escapeHtml(code)}"${checked ? ' checked' : ''}>
      <span class="loc-code">${escapeHtml(code || 'none')}</span>
      <span class="loc-name">${label}</span>
      <span class="loc-detail">${detail}</span>
    </label>`

  const none = item.entry
    ? radio('', `<strong>No region</strong> — the language itself`,
        `imports <code>n2words/${escapeHtml(item.entry)}</code> · spells like ${escapeHtml(item.landing)} · toCurrency needs an explicit currency`,
        state.region === null)
    : `<p class="loc-note">${escapeHtml(item.name)} has no bare tag — its variants differ in script or core numbering, so naming a region is required.</p>`

  const groups = spellings.map((group) => {
    const sample = item.sample?.texts[group.representative]
    const tied = item.sample?.tied?.[group.representative]
    const heading = spellings.length === 1
      ? ''
      : `<p class="loc-group">Spells like <code>${escapeHtml(group.representative)}</code>`
        + (sample
          ? ` <span class="loc-sample">${escapeHtml(item.sample.value)} → &ldquo;${escapeHtml(sample)}&rdquo;${tied ? ' — differs from its twin in another form' : ''}</span>`
          : '')
        + `</p>`

    const rows = group.codes.map((code) => {
      const member = state.variants.get(code)
      const clone = member.variantOf ? ` · same words as ${escapeHtml(member.variantOf)}` : ''
      const isDefault = code === item.default ? ` · what <code>${escapeHtml(item.entry)}</code> resolves to` : ''
      return radio(code, escapeHtml(member.name),
        `default currency ${escapeHtml(member.defaultCurrency ?? '—')}${clone}${isDefault}`,
        state.region === code)
    }).join('')

    return heading + rows
  }).join('')

  elements.localeBody.innerHTML = none + groups
  // A language with no bare tag makes the region a real choice, so it opens.
  if (!item.entry && state.region === null) elements.locale.open = true
}

// --------------------------------------------------------------- the output

/** Convert and paint the output panel and the snippet. */
async function run() {
  const item = variant()
  const form = item.forms[state.form]
  const input = value()

  if (input === '') {
    elements.output.dataset.state = 'idle'
    elements.outputText.textContent = '…'
    elements.outputMeta.textContent = ''
    renderSnippet(null)
    return
  }

  try {
    const words = await convert(item.code, state.form, input, callOptions())
    elements.output.dataset.state = 'ok'
    elements.outputText.textContent = words
    elements.outputText.lang = item.code
    elements.outputText.dir = item.dir
    elements.outputMeta.innerHTML = [
      `<span class="badge">${escapeHtml(state.form)}</span>`,
      `<span>${escapeHtml(item.name)}</span>`,
      `<span class="sep">·</span><span>${form.bundle ? `${formatBytes(form.bundle.gzip)} gzipped` : 'bundled'}</span>`,
      form.maxLabel ? `<span class="sep">·</span><span>defined below ${form.maxLabel}</span>` : '',
    ].join(' ')
    renderSnippet(words)
  }
  catch (error) {
    elements.output.dataset.state = 'error'
    elements.outputText.removeAttribute('dir')
    elements.outputText.textContent = describeError(error)
    elements.outputMeta.innerHTML = `<span class="badge">${escapeHtml(error?.name ?? 'Error')}</span>`
    renderSnippet(null)
  }
}

/**
 * Show the exact import and call that produced the current output, plus a note
 * whenever the specifier had to name a region the reader never asked for.
 *
 * @param {string | null} words The result, or null when there isn't one
 */
function renderSnippet(words) {
  const fn = FORM_FUNCTION[state.form]
  const call = `${fn}('${value()}'${formatOptions(callOptions())})`

  elements.snippet.innerHTML = [
    `<span class="kw">import</span> { ${fn} } <span class="kw">from</span> '${escapeHtml(specifier())}'`,
    '',
    escapeHtml(call),
    words === null ? '' : `<span class="cm">// → '${escapeHtml(words)}'</span>`,
  ].filter(line => line !== '').join('\n')

  const borrowed = state.region === null && state.form === 'currency' && state.currency === null && family().entry
  elements.snippetNote.hidden = !borrowed
  if (borrowed) {
    elements.snippetNote.innerHTML = `<code>${escapeHtml(variant().code)}</code>, not <code>${escapeHtml(family().entry)}</code>: `
      + `you asked for a country's default currency, and only a country has one.`
  }
}

// -------------------------------------------------------------- the compare

/** Convert the current value in one language after another. */
async function renderCompare() {
  const families = state.showAll
    ? state.manifest.families
    : COMPARE_SAMPLE.map(primary => state.families.get(primary)).filter(Boolean)
  const input = value()

  const results = await Promise.all(families.map(async (item) => {
    const member = state.variants.get(item.landing)
    // Cardinal and ordinal run through the bare tag — the code on the card.
    // Currency can't: a bare tag has no default currency, so the card names
    // the region it borrowed one from by showing that code instead.
    const usesRegion = state.form === 'currency' || !item.entry
    const shown = usesRegion ? member.code : item.entry

    if (!member.forms[state.form]) return { item, member, shown, text: `No ${state.form} form`, empty: true }
    if (input === '') return { item, member, shown, text: '…', empty: true }
    try {
      return { item, member, shown, text: await convert(shown, state.form, input), empty: false }
    }
    catch (error) {
      return { item, member, shown, text: describeError(error), empty: true }
    }
  }))

  elements.compare.innerHTML = results.map(({ item, member, shown, text, empty }) => `
    <article class="compare-item">
      <h3><span>${escapeHtml(item.name)}</span><span class="code">${escapeHtml(shown)}</span></h3>
      <p${empty ? ' class="empty"' : ` lang="${escapeHtml(member.code)}" dir="${member.dir}"`}>${escapeHtml(text)}</p>
    </article>
  `).join('')
}

// ------------------------------------------------------------------- state

/** Reflect the current selection in the URL so any result is linkable. */
function writeHash() {
  const query = new URLSearchParams(
    Object.entries(state.options).map(([key, item]) => [key, String(item)]),
  )
  if (state.currency !== null) query.set('currency', state.currency)
  const target = state.region ?? state.language
  const search = query.toString()
  history.replaceState(null, '', `#${target}/${state.form}/${encodeURIComponent(value())}${search ? `?${search}` : ''}`)
}

/**
 * Restore a selection from the URL hash, ignoring anything that no longer
 * exists. The first segment is read as a language when it names one and as a
 * variant code otherwise, so every `#en-US/cardinal/42` link shared before this
 * redesign still lands — on English, with the region set to en-US.
 */
function readHash() {
  const raw = location.hash.slice(1)
  if (!raw) return

  const [path, query] = raw.split('?')
  const [target, form, encoded] = path.split('/')

  if (state.families.has(target)) {
    state.language = target
    state.region = null
  }
  else if (state.variants.has(target)) {
    state.language = state.variants.get(target).primary
    state.region = target
  }

  if (FORMS.includes(form) && variant().forms[form]) state.form = form
  if (encoded !== undefined) elements.value.value = decodeURIComponent(encoded)

  const params = query ? Object.fromEntries(new URLSearchParams(query)) : {}
  if (params.currency !== undefined) state.currency = params.currency
  delete params.currency
  state.pendingOptions = Object.keys(params).length > 0 ? params : null
}

/** Apply option values restored from the URL to the freshly rendered panel. */
function applyPendingOptions() {
  if (!state.pendingOptions) return
  for (const [name, item] of Object.entries(state.pendingOptions)) {
    const control = document.querySelector(`[data-option="${CSS.escape(name)}"]`)
    if (!control) continue
    if (control.type === 'checkbox') control.checked = item === 'true'
    else control.value = item
  }
  state.pendingOptions = null
  readOptions()
}

/** Re-render everything that depends on the language, region or form. */
function refresh() {
  syncForms()
  // A currency the new language has no words for is dropped, not carried.
  if (state.currency !== null && !family().currencies.includes(state.currency)) state.currency = null
  renderCurrency()
  renderOptions()
  applyPendingOptions()
  renderLocale()
  run()
  renderCompare()
  writeHash()
}

// -------------------------------------------------------------------- init

async function init() {
  markCurrentPage()
  initTheme()
  state.manifest = await loadManifest()
  state.variants = new Map(state.manifest.variants.map(item => [item.code, item]))
  state.families = new Map(state.manifest.families.map(item => [item.primary, item]))

  $('#version').textContent = `v${state.manifest.version}`

  readHash()
  renderLanguages()
  refresh()

  let compareTimer
  elements.value.addEventListener('input', () => {
    run()
    writeHash()
    clearTimeout(compareTimer)
    compareTimer = setTimeout(renderCompare, 200)
  })

  elements.language.addEventListener('change', () => {
    state.language = elements.language.value
    state.region = null
    refresh()
  })

  elements.localeBody.addEventListener('change', (event) => {
    if (event.target.name !== 'region') return
    state.region = event.target.value === '' ? null : event.target.value
    refresh()
  })

  for (const radio of document.querySelectorAll('input[name="form"]')) {
    radio.addEventListener('change', () => {
      state.form = radio.value
      refresh()
    })
  }

  elements.currency.addEventListener('change', () => {
    state.currency = elements.currency.value
    renderCurrency()
    run()
    writeHash()
  })

  elements.options.addEventListener('change', () => {
    readOptions()
    run()
    writeHash()
  })

  elements.options.addEventListener('input', (event) => {
    if (event.target.type === 'text') {
      readOptions()
      run()
      writeHash()
    }
  })

  for (const button of document.querySelectorAll('[data-preset]')) {
    button.addEventListener('click', () => {
      elements.value.value = button.dataset.preset
      elements.value.dispatchEvent(new Event('input'))
    })
  }

  elements.compareToggle.addEventListener('click', () => {
    state.showAll = !state.showAll
    elements.compareToggle.textContent = state.showAll
      ? 'Show a sample'
      : `Show all ${state.manifest.families.length} languages`
    renderCompare()
  })

  wireCopy($('#copy-snippet'), () => elements.snippet.textContent)
}

init().catch((error) => {
  elements.outputText.textContent = `Could not load the demo: ${error.message}`
  elements.output.dataset.state = 'error'
})
