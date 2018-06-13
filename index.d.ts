declare module 'react-dev-utils/*' {
  const module: any
  export = module
}

declare module 'raf' {
  function polyfill(scope: any): void
}

declare module 'promise/lib/rejection-tracking' {
  function enable(): void
}

declare module 'object-assign' {
  const assign: typeof Object.assign
  export = assign
}
