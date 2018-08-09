import { I18nBundle, I18nText, LocaleBundle, LocaleModule } from '../types'

export function accessModule(localeModule: LocaleModule, path: string[]) {
  let data: LocaleModule = localeModule
  try {
    for (const key of path) {
      data = data.modules.find(m => m.key === key)!
    }
  } catch {
    return { key: '', modules: [], texts: [] } as LocaleModule
  }
  return data
}

function accessBundles(bundles: I18nBundle | I18nText, key: string) {
  const langs = Object.keys(bundles)
  return langs.reduce<I18nBundle | I18nText>(
    (val, lang) =>
      lang in bundles && bundles[lang]
        ? { ...val, [lang]: bundles[lang][key] }
        : val,
    {},
  )
}

function extractBundle(
  rootKey: string,
  bundles: I18nBundle,
  refBundle: LocaleBundle,
): LocaleModule {
  const keys = Object.keys(refBundle)
  const data: LocaleModule = { key: rootKey, modules: [], texts: [] }

  keys.forEach(key => {
    const refValue = refBundle[key]
    if (typeof refValue === 'string') {
      const values = accessBundles(bundles, key) as I18nText
      data.texts.push({ key, values })
    } else {
      const values = accessBundles(bundles, key) as I18nBundle

      data.modules.push(extractBundle(key, values, refValue))
    }
  })

  return data
}

/**
 * Load bundle data and converts it to internal module type
 * @todo Load data from all languages and merge data
 */
export function extractBundles(
  bundles: I18nBundle,
  refLang: string,
): LocaleModule {
  if (!(refLang in bundles)) {
    throw new Error(`"${refLang}" should be a key for bundles`)
  }
  return extractBundle('root', bundles, bundles[refLang])
}

export function serializeModule(
  lang: string,
  localeModule: LocaleModule,
): LocaleBundle {
  return {
    [localeModule.key]: {
      ...localeModule.texts.reduce(
        (bundle, { key, values }) =>
          lang in values && values[lang] !== ''
            ? { ...bundle, [key]: values[lang] }
            : bundle,
        {},
      ),
      ...localeModule.modules.reduce(
        (bundle, m) => ({ ...bundle, ...serializeModule(lang, m) }),
        {},
      ),
    },
  }
}

/**
 * Converts bundles which has language (column) keys into flat 2D array
 * @param bundles
 */
export function flattenBundles(bundles: I18nBundle): string[][] {
  const columns = Object.keys(bundles)

  let flattened: Array<{
    key: string
    texts: { [column: string]: string }
  }> = []

  columns.forEach(column => {
    function register(pathStack: string[], text: string) {
      const [ns, ...path] = pathStack
      const fullKey = `${ns}:${path.join('.')}`

      let isFound = false

      flattened = flattened.map(candidate => {
        if (candidate.key === fullKey) {
          isFound = true
          return { key: fullKey, texts: { ...candidate.texts, [column]: text } }
        }
        return candidate
      })

      if (!isFound) {
        flattened.push({ key: fullKey, texts: { [column]: text } })
      }
    }

    function access(obj: LocaleBundle | string, pathStack: string[]) {
      if (typeof obj === 'string') {
        register(pathStack, obj)
        return
      }

      Object.keys(obj).forEach(key => {
        access(obj[key], [...pathStack, key])
      })
    }

    // Recursively access all keys
    Object.entries(bundles[column]).map(([ns, val]) => {
      if (typeof val === 'string') {
        // Must be an object
        throw new Error('Invalid type of bundle')
      }

      // Dig into val with its key
      access(val, [ns])
    })
  })

  return flattened.map(row => [
    row.key,
    ...columns.map(column => row.texts[column] || ''),
  ])
}
