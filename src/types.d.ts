/** JSON interface for i18next locale resources */
export interface LocaleBundle {
  [key: string]: LocaleBundle | string
}

/** A structure for bundles that the server provides */
export interface I18nBundle {
  [lang: string]: LocaleBundle
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
