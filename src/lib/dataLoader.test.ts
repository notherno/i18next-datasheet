import en from '../data/en.json'
import { extractBundles } from './dataLoader'

describe('extractBundle', () => {
  it('loads resource bundles', () => {
    const [module] = extractBundles(['en'], [en])

    expect(module.key).toBe('en')
  })
})
