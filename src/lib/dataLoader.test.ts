import { I18nBundle } from '../types'
import { extractBundles, flattenBundles } from './dataLoader'

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
      ['greetings:formal.hello', 'Hello', 'こんにちは'],
      ['greetings:casual.hello', 'Hi', 'やあ'],
      ['greetings:casual.thanks', 'Thanks', 'ありがとう'],
    ]

    expect(formatJSON(actual)).toBe(formatJSON(expected))
  })
})
