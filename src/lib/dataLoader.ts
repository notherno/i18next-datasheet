import {
  FlattenedModule,
  I18nBundle,
  I18nText,
  LocaleBundle,
  LocaleModule,
} from '../types'

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

/**
 * Builds key for i18next
 * @todo Use of custom separator symbols
 */
export function buildFullKey(pathStack: string[]) {
  const [ns, ...path] = pathStack
  return path.length > 0 ? `${ns}:${path.join('.')}` : ns
}

/**
 * Destructs i18next key string and returns path stack
 * @todo Use of custom separator symbols
 */
export function destructFullKey(key: string) {
  const [ns, ...rest] = key.split(':')

  if (rest.length !== 1) {
    throw new Error('Namespace separator can only appear once')
  }

  return [ns, ...rest[0].split('.')]
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
 * Converts bundles which has language (column) keys into flat array
 */
export function flattenBundles(bundles: I18nBundle): FlattenedModule {
  const columns = Object.keys(bundles)

  let flattened: FlattenedModule = []

  columns.forEach(column => {
    /** Update `flattened` */
    function register(pathStack: string[], text: string) {
      const fullKey = buildFullKey(pathStack)

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

    /** Dig into the bundle object and call `register` if it hits string */
    function access(obj: LocaleBundle | string, pathStack: string[]) {
      if (typeof obj === 'string') {
        register(pathStack, obj)
        return
      }

      Object.keys(obj).forEach(key => {
        if (obj[key] == null) {
          return
        }

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

  return flattened
}

/**
 * Restructure the while locale bundles from imported flattened array
 */
export function restructureBundles(flattened: FlattenedModule): I18nBundle {
  const bundle: I18nBundle = {}

  function putText(ref: LocaleBundle, pathStack: string[], text: string) {
    if (pathStack.length === 0) {
      return
    }

    if (pathStack.length === 1) {
      const textKey = pathStack[0]

      if (ref[textKey] != null) {
        throw new Error('Duplicated key assignment detected')
      }

      ref[textKey] = text
      return
    }

    const [key, ...rest] = pathStack

    let target: LocaleBundle

    if (ref[key] == null) {
      target = ref[key] = {}
    } else if (typeof ref[key] === 'object') {
      target = ref[key] as LocaleBundle
    } else {
      throw new Error('Module cannot be placed')
    }

    putText(target, rest, text)
  }

  flattened.forEach(row => {
    if (typeof row.key !== 'string') {
      throw new Error('key parameter must be set')
    }

    const pathStack = destructFullKey(row.key)

    // Assign objects
    Object.entries(row.texts).forEach(([column, text]) => {
      if (typeof column !== 'string' || typeof text !== 'string') {
        throw new Error('Somethings went wrong with texts')
      }

      putText(bundle, [column, ...pathStack], text)
    })
  })

  return bundle
}
