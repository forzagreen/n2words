/**
 * The live converter.
 *
 * Nothing here knows anything about a specific language: the picker, the
 * per-form availability, the options panel and the code snippet are all
 * rendered from `languages.json`, which is generated from `src/` at deploy
 * time. Adding a language to the library adds it here.
 */

import {
  FORMS, convert, entryPoint, escapeHtml, formatBytes, formatOptions,
  loadManifest, markCurrentPage, wireCopy,
} from './app.js'

/** A spread of scripts and numbering systems for the default compare grid. */
const COMPARE_SAMPLE = [
  'en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR',
  'ru-RU', 'ar-SA', 'hi-IN', 'zh-Hans-CN', 'ja-JP', 'sw-KE',
]

const $ = selector => document.querySelector(selector)

const elements = {
  value: $('#value'),
  language: $('#language'),
  options: $('#options'),
  output: $('#output'),
  outputText: $('#output-text'),
  outputMeta: $('#output-meta'),
  snippet: $('#snippet'),
  compare: $('#compare'),
  compareToggle: $('#compare-toggle'),
}

/** @type {{ manifest: object, variants: Map<string, object>, code: string, form: string, options: Record<string, unknown>, showAll: boolean }} */
const state = {
  manifest: null,
  variants: new Map(),
  code: 'en-US',
  form: 'cardinal',
  options: {},
  showAll: false,
}

// ---------------------------------------------------------------- helpers

const variant = () => state.variants.get(state.code)

/** @returns {string} The reader's input, trimmed. */
const value = () => elements.value.value.trim()

/**
 * The message to show for a thrown conversion. The library's two failure
 * modes are deliberate and worth showing rather than hiding — a RangeError
 * names the ceiling it hit, a TypeError explains the bad option — so its own
 * wording is what the reader sees, tagged with the error name beside it.
 *
 * @param {unknown} error The thrown value
 * @returns {string} Message to display
 */
function describeError(error) {
  return error instanceof Error ? error.message : String(error)
}

// -------------------------------------------------------------- rendering

/** Fill the language picker, grouped by BCP 47 language family. */
function renderLanguages() {
  elements.language.innerHTML = state.manifest.families.map(family => `
    <optgroup label="${escapeHtml(family.name)}">
      ${family.variants.map((code) => {
        const item = state.variants.get(code)
        return `<option value="${escapeHtml(code)}">${escapeHtml(item.name)} — ${escapeHtml(code)}</option>`
      }).join('')}
    </optgroup>
  `).join('')
  elements.language.value = state.code
}

/**
 * Enable only the forms this language exports, and fall back to one it does
 * if the current selection isn't available.
 */
function syncForms() {
  const available = variant().forms
  for (const form of FORMS) {
    document.querySelector(`#form-${form}`).disabled = available[form] === undefined
  }
  if (available[state.form] === undefined) state.form = Object.keys(available)[0]
  document.querySelector(`#form-${state.form}`).checked = true
}

/**
 * Render the options panel for the current language and form, straight from
 * the options contract each form declares. An enum option becomes a select, a
 * boolean a checkbox; anything else a text field.
 */
function renderOptions() {
  const options = variant().forms[state.form]?.options ?? []

  elements.options.innerHTML = options.map((option) => {
    const id = `option-${option.name}`
    const label = `<label for="${id}">${escapeHtml(option.name)}</label>`
    const hint = `<p class="hint" id="${id}-hint">${escapeHtml(option.description)}</p>`

    if (option.values) {
      const items = option.values.map((item) => {
        // The currency enum is the one set worth labelling — a bare ISO code
        // is not self-explanatory, and the manifest already carries the names.
        const name = state.manifest.currencies[item]
        const text = name ? `${item} — ${name}` : item
        const isDefault = String(item) === option.default
        return `<option value="${escapeHtml(item)}"${isDefault ? ' selected' : ''}>${escapeHtml(text)}${isDefault ? ' (default)' : ''}</option>`
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
 * reader actually changed. Passing just the overrides keeps the generated
 * snippet honest: it shows the shortest call that produces this output.
 */
function readOptions() {
  const declared = variant().forms[state.form]?.options ?? []
  state.options = {}

  for (const option of declared) {
    const control = document.querySelector(`[data-option="${CSS.escape(option.name)}"]`)
    if (!control) continue
    const current = control.type === 'checkbox' ? control.checked : control.value
    if (String(current) !== option.default) state.options[option.name] = current
  }
}

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
    const words = await convert(state.code, state.form, input, state.options)
    elements.output.dataset.state = 'ok'
    elements.outputText.textContent = words
    elements.outputText.lang = state.code
    elements.outputText.dir = item.dir
    elements.outputMeta.innerHTML = [
      `<span class="badge">${escapeHtml(state.form)}</span>`,
      `<span>${escapeHtml(item.name)}</span>`,
      `<span class="sep">·</span><span>${form.bundle ? `${formatBytes(form.bundle.gzip)} gzipped bundle` : 'bundled'}</span>`,
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
 * Show the exact import and call that produced the current output.
 *
 * @param {string | null} words The result, or null when there isn't one
 */
function renderSnippet(words) {
  const item = variant()
  const fn = { cardinal: 'toCardinal', ordinal: 'toOrdinal', currency: 'toCurrency' }[state.form]
  const specifier = entryPoint(item, state.form, state.options)
  const call = `${fn}('${value()}'${formatOptions(state.options)})`

  elements.snippet.innerHTML = [
    `<span class="kw">import</span> { ${fn} } <span class="kw">from</span> '${escapeHtml(specifier)}'`,
    '',
    escapeHtml(call),
    words === null ? '' : `<span class="cm">// → '${escapeHtml(words)}'</span>`,
  ].filter(line => line !== '').join('\n')
}

/** Convert the current value in many languages at once. */
async function renderCompare() {
  const codes = state.showAll
    ? [...state.variants.keys()]
    : COMPARE_SAMPLE.filter(code => state.variants.has(code))
  const input = value()

  const results = await Promise.all(codes.map(async (code) => {
    const item = state.variants.get(code)
    if (!item.forms[state.form]) return { item, text: `No ${state.form} form`, empty: true }
    if (input === '') return { item, text: '…', empty: true }
    try {
      return { item, text: await convert(code, state.form, input), empty: false }
    }
    catch (error) {
      return { item, text: describeError(error), empty: true }
    }
  }))

  elements.compare.innerHTML = results.map(({ item, text, empty }) => `
    <article class="compare-item">
      <h3><span>${escapeHtml(item.name)}</span><span class="code">${escapeHtml(item.code)}</span></h3>
      <p${empty ? ' class="empty"' : ` lang="${escapeHtml(item.code)}" dir="${item.dir}"`}>${escapeHtml(text)}</p>
    </article>
  `).join('')
}

// ------------------------------------------------------------------ state

/** Reflect the current selection in the URL so any result is linkable. */
function writeHash() {
  const query = new URLSearchParams(
    Object.entries(state.options).map(([key, item]) => [key, String(item)]),
  ).toString()
  const hash = `#${state.code}/${state.form}/${encodeURIComponent(value())}${query ? `?${query}` : ''}`
  history.replaceState(null, '', hash)
}

/**
 * Restore a selection from the URL hash, ignoring anything that no longer
 * exists (a language removed, an option renamed) rather than failing.
 */
function readHash() {
  const raw = location.hash.slice(1)
  if (!raw) return

  const [path, query] = raw.split('?')
  const [code, form, encoded] = path.split('/')

  if (state.variants.has(code)) state.code = code
  if (FORMS.includes(form) && variant().forms[form]) state.form = form
  if (encoded !== undefined) elements.value.value = decodeURIComponent(encoded)

  // Options are applied after the panel is rendered, in refresh().
  state.pendingOptions = query ? Object.fromEntries(new URLSearchParams(query)) : null
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

/** Re-render everything that depends on the language or form. */
function refresh() {
  syncForms()
  renderOptions()
  applyPendingOptions()
  run()
  renderCompare()
  writeHash()
}

// ------------------------------------------------------------------- init

async function init() {
  markCurrentPage()
  state.manifest = await loadManifest()
  state.variants = new Map(state.manifest.variants.map(item => [item.code, item]))

  for (const [key, count] of Object.entries(state.manifest.counts)) {
    const target = document.querySelector(`[data-stat="${key}"]`)
    if (target) target.textContent = String(count)
  }
  document.querySelector('#version').textContent = `v${state.manifest.version}`

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
    state.code = elements.language.value
    refresh()
  })

  for (const radio of document.querySelectorAll('input[name="form"]')) {
    radio.addEventListener('change', () => {
      state.form = radio.value
      refresh()
    })
  }

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
      elements.output.classList.remove('flash')
      void elements.output.offsetWidth
      elements.output.classList.add('flash')
    })
  }

  elements.compareToggle.addEventListener('click', () => {
    state.showAll = !state.showAll
    elements.compareToggle.textContent = state.showAll ? 'Show a sample' : 'Show all variants'
    renderCompare()
  })

  wireCopy(document.querySelector('#copy-snippet'), () => elements.snippet.textContent)
}

init().catch((error) => {
  elements.outputText.textContent = `Could not load the demo: ${error.message}`
  elements.output.dataset.state = 'error'
})
