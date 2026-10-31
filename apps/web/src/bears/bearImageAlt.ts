import { PLACEHOLDER_IMAGE_URL } from '../api/fetching.ts';
import type Bear from '../types.ts';

// Screen readers already announce "image", so the alt text names only what is
// shown. The placeholder does not show this bear, so it must not claim to.
export function getBearImageAlt(bear: Bear): string {
  return bear.image === PLACEHOLDER_IMAGE_URL
    ? `No photo available of the ${bear.name}`
    : bear.name;
}
