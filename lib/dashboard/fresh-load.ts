export async function loadFreshDashboardSections<const T extends readonly unknown[]>(input: {
  clear: () => void
  loaders: { readonly [K in keyof T]: () => Promise<T[K]> }
}): Promise<{ [K in keyof T]: PromiseSettledResult<T[K]> }> {
  input.clear()
  return Promise.allSettled(input.loaders.map((load) => load())) as Promise<{ [K in keyof T]: PromiseSettledResult<T[K]> }>
}
