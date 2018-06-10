import { extractBundles } from './dataLoader'

const bundle = {
  en: {
    greetings: {
      hello: 'hi',
    },
  },
  ja: {
    greetings: {
      hello: 'やあ',
    },
  },
}

describe('extractBundle', () => {
  it('loads resource bundles', () => {
    const module = extractBundles(bundle, 'en')

    const expected = {
      key: 'root',
      modules: [
        {
          key: 'greetings',
          modules: [],
          texts: [
            {
              key: 'hello',
              values: {
                en: 'hi',
                ja: 'やあ',
              },
            },
          ],
        },
      ],
      texts: [],
    }

    expect(module.key).toBe('root')
    expect(JSON.stringify(module, null, '  ')).toBe(
      JSON.stringify(expected, null, '  '),
    )
  })
})
