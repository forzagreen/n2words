/**
 * Shared site helpers.
 *
 * The site has no build step and no framework: pages import this module
 * directly, and it loads two things — `languages.json` (generated from src/
 * at deploy time) and the real `dist/` bundles, imported on demand. Every
 * word this site shows is produced by the published library running in the
 * reader's browser, not by a fixture.
 */

/** Form key -> the function a per-form bundle exports. */
export const FORM_FN = { cardinal: 'toCardinal', ordinal: 'toOrdinal', currency: 'toCurrency' }

export const FORMS = ['cardinal', 'ordinal', 'currency']

let manifestPromise

/**
 * Load (once) the generated manifest of every variant, form and option.
 *
 * @returns {Promise<object>} The manifest
 */
export function loadManifest() {
  manifestPromise ??= fetch(new URL('languages.json', import.meta.url))
    .then((response) => {
      if (!response.ok) throw new Error(`languages.json: HTTP ${response.status}`)
      return response.json()
    })
  return manifestPromise
}

const bundles = new Map()

/**
 * Import one language's per-form bundle — `dist/{code}/{form}.js`, the same
 * file a CDN would serve. Each is fetched at most once per page.
 *
 * @param {string} code Language code
 * @param {string} form 'cardinal' | 'ordinal' | 'currency'
 * @returns {Promise<Record<string, Function>>} The bundle's namespace
 */
export function loadBundle(code, form) {
  const key = `${code}/${form}`
  if (!bundles.has(key)) {
    bundles.set(key, import(new URL(`dist/${key}.js`, import.meta.url).href))
  }
  return bundles.get(key)
}

/**
 * Run a conversion in the browser.
 *
 * `value` is passed through as the trimmed string the reader typed rather
 * than as a Number: the library accepts numeric strings, and that's what
 * keeps a 40-digit input exact instead of rounding it to a float.
 *
 * @param {string} code Language code
 * @param {string} form Form key
 * @param {string} value The raw input
 * @param {Record<string, unknown>} [options] Only the options the reader changed
 * @returns {Promise<string>} The words
 */
export async function convert(code, form, value, options) {
  const bundle = await loadBundle(code, form)
  const fn = bundle[FORM_FN[form]]
  return options && Object.keys(options).length > 0 ? fn(value, options) : fn(value)
}

/**
 * @param {number} bytes Byte count
 * @returns {string} e.g. "1.9 KB"
 */
export function formatBytes(bytes) {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`
}

/**
 * The import specifier a reader should actually type for this call.
 *
 * A bare tag is the documented primary entry point, but it names a *language*,
 * and `toCurrency`'s default currency belongs to a *country* — so a currency
 * call that doesn't name its currency has to import the region-qualified code.
 * That's the same rule the README states, applied to whatever the demo is
 * currently doing.
 *
 * @param {object} variant Manifest entry
 * @param {string} form Form key
 * @param {Record<string, unknown>} options Options the reader changed
 * @returns {string} e.g. 'n2words/en' or 'n2words/en-US'
 */
export function entryPoint(variant, form, options) {
  const needsRegion = form === 'currency' && options.currency === undefined
  return `n2words/${needsRegion ? variant.code : variant.entry}`
}

/**
 * Render an options object as the JS literal a snippet would show. Values are
 * already correctly typed (booleans stay booleans, enums are quoted).
 *
 * @param {Record<string, unknown>} options Options the reader changed
 * @returns {string} e.g. ", { currency: 'GBP' }" or ''
 */
export function formatOptions(options) {
  const entries = Object.entries(options)
  if (entries.length === 0) return ''
  const body = entries
    .map(([key, value]) => `${key}: ${typeof value === 'string' ? `'${value}'` : value}`)
    .join(', ')
  return `, { ${body} }`
}

/**
 * Escape text for insertion into HTML. The site builds a few fragments as
 * strings (table rows, code snippets) and every interpolated value — language
 * names, converted words, error messages — goes through here first.
 *
 * @param {unknown} text Value to escape
 * @returns {string} Escaped text
 */
export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;',
  }[char]))
}

/**
 * Wire up a "copy" button. Falls back silently where the clipboard API is
 * unavailable (an insecure origin, say) rather than showing a broken control.
 *
 * @param {HTMLButtonElement} button The button
 * @param {() => string} getText Produces the text to copy at click time
 */
export function wireCopy(button, getText) {
  if (!navigator.clipboard) {
    button.hidden = true
    return
  }
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(getText())
      const original = button.textContent
      button.textContent = 'Copied'
      setTimeout(() => {
        button.textContent = original
      }, 1200)
    }
    catch { /* the reader can still select the text */ }
  })
}

const THEME_KEY = 'n2words:theme'

/**
 * Wire the system/light/dark control.
 *
 * "System" is the absence of a stored choice, not a third stored value, so a
 * reader who never touches this follows their OS forever — including when they
 * switch it mid-visit. An explicit choice sets `data-theme` on the root, which
 * the stylesheet honours over `prefers-color-scheme` in both directions. A
 * matching inline script in each page's head applies the stored choice before
 * first paint; this only keeps the buttons in sync.
 */
export function initTheme() {
  const buttons = [...document.querySelectorAll('[data-theme-choice]')]
  if (buttons.length === 0) return

  const read = () => {
    try {
      const stored = localStorage.getItem(THEME_KEY)
      return stored === 'light' || stored === 'dark' ? stored : 'system'
    }
    catch {
      return 'system'
    }
  }

  const paint = (choice) => {
    if (choice === 'system') delete document.documentElement.dataset.theme
    else document.documentElement.dataset.theme = choice
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === choice))
    }
  }

  paint(read())

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const choice = button.dataset.themeChoice
      try {
        if (choice === 'system') localStorage.removeItem(THEME_KEY)
        else localStorage.setItem(THEME_KEY, choice)
      }
      catch { /* the choice still applies for this page view */ }
      paint(choice)
    })
  }
}

/**
 * Mark the current page in the header nav.
 */
export function markCurrentPage() {
  const here = location.pathname.replace(/index\.html$/, '')
  for (const link of document.querySelectorAll('.site-nav a')) {
    const target = new URL(link.getAttribute('href'), location.href).pathname.replace(/index\.html$/, '')
    if (target === here) link.setAttribute('aria-current', 'page')
  }
}
