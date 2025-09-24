// Polyfill simples para import.meta
if (typeof globalThis !== 'undefined' && !globalThis.import) {
  globalThis.import = {
    meta: {
      url: typeof window !== 'undefined' ? window.location.href : 'file:///',
      env: typeof process !== 'undefined' ? process.env : {}
    }
  };
}