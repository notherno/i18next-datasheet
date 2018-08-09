function generateHash (source: string) {
  return Array.from(source).reduce((a, b) => {
    // tslint:disable no-bitwise
    const t = ((a << 5) - a) + b.charCodeAt(0)
    return t & t
    // tslint:enable
  }, 0)
}

export function colorize(name: string) {
  const hash = generateHash(name)
  return `hsl(${hash % 360}, 40%, 50%)`
}
