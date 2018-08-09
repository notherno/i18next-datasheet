/** JSON interface for i18next locale resources */
export interface LocaleBundle {
  [key: string]: LocaleBundle | string
}

/** A structure for bundles whic key is language or that identifier */
export interface I18nBundle {
  [lang: string]: LocaleBundle
}

/** The data structure that the server provides */
export interface BundleResponse {
  langs: string[]
  bundle: I18nBundle
}

export interface I18nText {
  [lang: string]: string
}

/** An internal structure for manage locale data */
export interface LocaleModule {
  key: string
  modules: LocaleModule[]
  texts: LocaleText[]
}

interface LocaleText {
  key: string
  values: { [lang: string]: string }
}

export type FlattenedModule = Array<{
  key: string
  texts: { [lang: string]: string }
}>
