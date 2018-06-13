/** JSON interface for i18next locale resources */
export interface LocaleBundle {
  [key: string]: LocaleBundle | string
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
