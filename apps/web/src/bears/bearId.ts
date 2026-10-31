import type Bear from '../types.ts';

// Stable identifier for routes and list keys. The binomial is unique per
// species and comes from the data itself, so it does not change when the list
// is reordered or filtered (unlike an array index). "U. arctos" -> "u-arctos"
export function getBearId(bear: Bear): string {
  return bear.binomial
    .toLowerCase()
    .replace(/[^a-z0-9]+/gv, '-')
    .replace(/^-|-$/gv, '');
}
