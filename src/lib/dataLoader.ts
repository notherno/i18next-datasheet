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
