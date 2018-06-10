import { extractBundles } from './dataLoader'

const en = {
  en: {
    greetings: {
      hello: 'hi',
    },
  },
}

describe('extractBundle', () => {
  it('loads resource bundles', () => {
    const module = extractBundles(en, 'en')

    expect(module.key).toBe('root')
  })
})
