/**
 * A length in mm as CSS. `--u` is one real millimetre when printing and the
 * zoom level on screen, so everything drawn through this prints true to size.
 */
export const mm = (n: number) => `calc(${n} * var(--u))`
