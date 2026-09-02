/**
 * Options Extraction
 *
 * Reads each language's options contract — option names, types, descriptions
 * and defaults — by type-checking `src/**` with the same project config the
 * repo already uses for checkJs. Shared by the two generators that need it:
 * `generate-languages-md.js` (LANGUAGES.md) and `generate-site-data.js` (the
 * GitHub Pages manifest), so the docs table and the demo's options panel are
 * the same data rendered twice and can't disagree.
 *
 * @module options-index
 */

import { resolve } from 'node:path'
import { API } from 'typescript/unstable/sync'
import { isFunctionDeclaration, isIdentifier } from 'typescript/unstable/ast'

/**
 * @typedef {Object} OptionInfo
 * @property {string} name - Option name (e.g., 'gender')
 * @property {string} type - JSDoc-style type ('boolean', "('masculine'|'feminine')")
 * @property {string} [defaultValue] - Default value if specified
 * @property {string} description - Description from JSDoc
 * @property {string} form - Which form this option applies to ('cardinal' etc.)
 */

/** Form function name -> the form key it implements. */
export const FORM_FUNCTIONS = { toCardinal: 'cardinal', toOrdinal: 'ordinal', toCurrency: 'currency' }

/**
 * Render a property's resolved type back into the JSDoc-style string the
 * markdown renderer expects: a string-literal union becomes
 * `('a'|'b')`, everything else uses its plain type name (`boolean`, `string`).
 *
 * @param {import('typescript/unstable/sync').Checker} checker
 * @param {import('typescript/unstable/sync').Type} propType
 * @returns {string}
 */
function toDocType(checker, propType) {
  // Optional props arrive as `T | undefined`; drop the undefined first.
  const type = checker.getNonNullableType(propType) ?? propType
  const parts = type.isUnionType() ? (type.getTypes() ?? []) : [type]

  if (parts.length > 0 && parts.every(t => t.isStringLiteralType())) {
    const literals = parts.map(t => `'${t.value}'`)
    return parts.length > 1 ? `(${literals.join('|')})` : literals[0]
  }

  return checker.typeToString(type)
}

/**
 * Build code -> (functionName -> OptionInfo[]) by type-checking the language
 * sources once. Option names, types, and descriptions come straight from the
 * checker (the same view TypeScript exposes to consumers), so the docs can't
 * drift from comment formatting the way the old regex scrape could.
 *
 * Uses `typescript/unstable/sync`, the native-compiler ("tsgo") API that
 * replaced the classic `ts.createProgram` surface in typescript@7 — the
 * client spawns the bundled tsgo binary as a subprocess and talks to it
 * per-request, so the `API` instance is closed once extraction is done.
 *
 * @param {string[]} codes Language codes
 * @param {Map<string, object>} mods Code -> module namespace (for `<form>Defaults` exports)
 * @returns {Map<string, Map<string, OptionInfo[]>>}
 */
export function buildOptionsIndex(codes, mods) {
  const api = new API({ cwd: process.cwd() })
  try {
    // src/tsconfig.json is the project this repo already maintains for
    // checkJs coverage of src/**/*.js (see that file's own comment) — reusing
    // it means compiler options can't drift between editor/CI type-checking
    // and this doc generator.
    const configFileName = resolve('src/tsconfig.json')
    api.parseConfigFile(configFileName)
    const openFiles = codes.map(code => resolve('src', `${code}.js`))
    const snapshot = api.updateSnapshot({ openFiles })
    const project = snapshot.getProject(configFileName)
    if (!project) {
      throw new Error(`Could not load project "${configFileName}" — cannot extract options`)
    }
    const checker = project.checker
    const index = new Map()

    for (const code of codes) {
      const sourceFile = project.program.getSourceFile(resolve('src', `${code}.js`))
      if (!sourceFile) {
        throw new Error(`Could not load source for "${code}" (src/${code}.js) — cannot extract options`)
      }
      const byFunction = new Map()

      for (const node of sourceFile.statements) {
        if (!isFunctionDeclaration(node) || !node.name) continue
        const fnName = node.name.text
        if (!(fnName in FORM_FUNCTIONS)) continue

        const optionsParam = node.parameters.find(
          p => isIdentifier(p.name) && p.name.text === 'options',
        )
        if (!optionsParam) continue

        const rawType = checker.getTypeAtLocation(optionsParam)
        const type = (rawType && checker.getNonNullableType(rawType)) ?? rawType

        // Defaults come from the options contract's `<form>Defaults` export —
        // imported, the single source of truth. A form taking options without it
        // is a contract violation (the gate enforces this too), so fail loudly
        // rather than scrape JSDoc or the function body.
        const formDefaults = /** @type {Record<string, unknown> | undefined} */ (
          mods.get(code)?.[`${FORM_FUNCTIONS[fnName]}Defaults`]
        )
        if (formDefaults === undefined) {
          throw new Error(`${code} ${fnName}() accepts options but doesn't export ${FORM_FUNCTIONS[fnName]}Defaults — every options-taking form must declare its contract`)
        }
        const options = checker.getPropertiesOfType(type).map((prop) => {
          const name = prop.name
          const description = prop
            .getDocumentationComment(checker)
            .trim()
            .replace(/^-\s*/, '')
            .trim()
          return {
            name,
            type: toDocType(checker, checker.getTypeOfSymbolAtLocation(prop, optionsParam)),
            defaultValue: Object.hasOwn(formDefaults, name) ? String(formDefaults[name]) : undefined,
            description,
            form: FORM_FUNCTIONS[fnName],
          }
        })

        if (options.length > 0) byFunction.set(fnName, options)
      }

      index.set(code, byFunction)
    }

    return index
  }
  finally {
    api.close()
  }
}
