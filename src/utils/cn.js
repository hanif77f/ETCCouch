/**
 * Lightweight className combiner. Filters falsy values and joins with spaces.
 * Keeps components dependency-free while allowing conditional classes.
 * @param  {...(string|false|null|undefined)} classes
 * @returns {string}
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

