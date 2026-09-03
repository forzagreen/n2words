/**
 * Google Analytics (GA4).
 *
 * Google's snippet, with two changes. It lives in one file rather than pasted
 * into three pages, so the measurement ID has a single home; and it does not
 * load on localhost, because `node --run site:serve` serves the very same
 * files and every development reload would otherwise be reported as traffic.
 */

const MEASUREMENT_ID = 'G-MCQE5W93PN'
const LOCAL = new Set(['localhost', '127.0.0.1', '[::1]', ''])

window.dataLayer = window.dataLayer || []

// Google's own shape: the tag reads the queued `arguments` objects, so this
// cannot become a rest parameter (that would queue plain arrays instead).
function gtag() {
  window.dataLayer.push(arguments)
}
window.gtag = gtag

if (!LOCAL.has(location.hostname)) {
  const tag = document.createElement('script')
  tag.async = true
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
  document.head.append(tag)

  gtag('js', new Date())
  gtag('config', MEASUREMENT_ID)
}
