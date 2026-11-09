import { useState } from 'react';
import type { ReactElement } from 'react';
import type Bear from '../types.ts';

const PLACEHOLDER_IMAGE_URL = '/media/placeholder-bear.png';

interface BearImageProps {
  bear: Bear;
  className?: string;
}

// Two reasons for the placeholder: the API found no image (imageUrl is null),
// or the image exists but fails to load in the browser (onError).
export default function BearImage({
  bear,
  className,
}: BearImageProps): ReactElement {
  // Remember which URL failed instead of a plain boolean: when the detail page
  // switches to another bear, its image gets a fresh chance to load.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const imageUrl = bear.imageUrl === failedUrl ? null : bear.imageUrl;

  return (
    <img
      className={className}
      src={imageUrl ?? PLACEHOLDER_IMAGE_URL}
      // Screen readers already announce "image", so the alt text names only
      // what is shown. The placeholder does not show this bear.
      alt={
        imageUrl === null ? `No photo available of the ${bear.name}` : bear.name
      }
      onError={() => {
        setFailedUrl(imageUrl);
      }}
    />
  );
}
