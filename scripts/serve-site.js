/**
 * Static server for the built site — local preview only, never deployed.
 *
 * GitHub Pages serves `_site/` over HTTP, and the demo uses dynamic `import()`,
 * which the file:// protocol refuses. This is the smallest thing that makes
 * `_site/` browsable locally under the same conditions; it stays dependency-free
 * like the rest of the project.
 *
 * Usage:
 *   node --run site:serve          # http://localhost:8080
 *   node scripts/serve-site.js 3000
 */

import { createServer } from 'node:http'
import { createReadStream, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'

const ROOT = '_site'
const port = Number(process.argv[2] ?? 8080)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
}

createServer((request, response) => {
  // Resolve within ROOT: normalize collapses any `..` before it can escape.
  const path = normalize(decodeURIComponent(new URL(request.url, 'http://localhost').pathname))
  let file = join(ROOT, path)

  try {
    if (statSync(file).isDirectory()) file = join(file, 'index.html')
    statSync(file)
  }
  catch {
    response.writeHead(404, { 'content-type': 'text/plain' }).end('404')
    return
  }

  response.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
  createReadStream(file).pipe(response)
}).listen(port, () => console.log(`Serving ${ROOT}/ at http://localhost:${port}`))
