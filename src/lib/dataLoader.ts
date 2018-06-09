export interface LocaleBundle {
  [key: string]: LocaleBundle | string
}

export interface LocaleModule {
  key: string
  modules: LocaleModule[]
  texts: LocaleText[]
}

interface LocaleText {
  key: string
  text: string
}

export function accessText(
  localeModule: LocaleModule | undefined,
  key: string,
) {
  if (localeModule == null) {
    return ''
  }
  const text = localeModule.texts.find(t => t.key === key)
  return text ? text.text : ''
}

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

function extractBundle(
  rootKey: string,
  bundle: LocaleBundle,
  refBundle?: LocaleBundle,
) {
  const targetBundle = refBundle ? refBundle : bundle

  const keys = Object.keys(targetBundle)
  const data: LocaleModule = { key: rootKey, modules: [], texts: [] }

  keys.forEach(key => {
    const refValue = targetBundle[key]
    const value = key in bundle ? bundle[key] : null
    if (typeof refValue === 'string') {
      if (value != null && typeof value === 'string') {
        data.texts.push({ key, text: value })
      }
    } else {
      if (value == null || typeof value === 'string') {
        data.modules.push(extractBundle(key, { [key]: {} }, refValue))
      } else {
        data.modules.push(extractBundle(key, value, refValue))
      }
    }
  })

  return data
}

export function extractBundles(
  langs: string[],
  bundles: LocaleBundle[],
): LocaleModule[] {
  return bundles.map((bundle, index) =>
    extractBundle(langs[index], bundle, bundles[0]),
  )
}

export function serializeModule(localeModule: LocaleModule): LocaleBundle {
  return {
    [localeModule.key]: {
      ...localeModule.texts.reduce(
        (bundle, { key, text }) =>
          text !== '' ? { ...bundle, [key]: text } : bundle,
        {},
      ),
      ...localeModule.modules.reduce(
        (bundle, m) => ({ ...bundle, ...serializeModule(m) }),
        {},
      ),
    },
  }
}
