import { FlattenedModule, I18nBundle } from '../types'
import {
  extractBundles,
  flattenBundles,
  restructureBundles,
} from './dataLoader'

const bundle: I18nBundle = {
  en: {
    greetings: {
      formal: {
        hello: 'Hello',
      },
      casual: {
        hello: 'Hi',
        thanks: 'Thanks',
      },
    },
  },
  ja: {
    greetings: {
      formal: {
        hello: 'こんにちは',
      },
      casual: {
        hello: 'やあ',
        thanks: 'ありがとう',
      },
    },
  },
}

function formatJSON(data: any) {
  return JSON.stringify(data, null, '  ')
}

describe('extractBundles', () => {
  it('loads resource bundles', () => {
    const actual = extractBundles(bundle, 'en')

    const expected = {
      key: 'root',
      modules: [
        {
          key: 'greetings',
          modules: [
            {
              key: 'formal',
              modules: [],
              texts: [
                {
                  key: 'hello',
                  values: {
                    en: 'Hello',
                    ja: 'こんにちは',
                  },
                },
              ],
            },
            {
              key: 'casual',
              modules: [],
              texts: [
                {
                  key: 'hello',
                  values: {
                    en: 'Hi',
                    ja: 'やあ',
                  },
                },
                {
                  key: 'thanks',
                  values: {
                    en: 'Thanks',
                    ja: 'ありがとう',
                  },
                },
              ],
            },
          ],
          texts: [],
        },
      ],
      texts: [],
    }

    expect(actual.key).toBe('root')

    expect(formatJSON(actual)).toBe(formatJSON(expected))
  })
})

describe('flattenBundles', () => {
  it('loads resource bundles', () => {
    const actual = flattenBundles(bundle)

    const expected = [
      {
        key: 'greetings:formal.hello',
        texts: { en: 'Hello', ja: 'こんにちは' },
      },
      { key: 'greetings:casual.hello', texts: { en: 'Hi', ja: 'やあ' } },
      {
        key: 'greetings:casual.thanks',
        texts: { en: 'Thanks', ja: 'ありがとう' },
      },
    ]

    expect(formatJSON(actual)).toBe(formatJSON(expected))
  })
})

describe('restructureBundles', () => {
  it('loads flattened bundles and outputs structured bundle', () => {
    const input: FlattenedModule = [
      {
        key: 'greetings:formal.hello',
        texts: { en: 'Hello', ja: 'こんにちは' },
      },
      { key: 'greetings:casual.hello', texts: { en: 'Hi', ja: 'やあ' } },
      {
        key: 'greetings:casual.thanks',
        texts: { en: 'Thanks', ja: 'ありがとう' },
      },
    ]

    const actual = restructureBundles(input)

    const expected: I18nBundle = {
      en: {
        greetings: {
          formal: {
            hello: 'Hello',
          },
          casual: {
            hello: 'Hi',
            thanks: 'Thanks',
          },
        },
      },
      ja: {
        greetings: {
          formal: {
            hello: 'こんにちは',
          },
          casual: {
            hello: 'やあ',
            thanks: 'ありがとう',
          },
        },
      },
    }

    expect(formatJSON(actual)).toBe(formatJSON(expected))
  })
})
