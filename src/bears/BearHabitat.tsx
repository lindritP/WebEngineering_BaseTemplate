import type { ReactElement } from 'react';

interface BearHabitatProps {
  description: string;
  imageSrc: string;
  imageAlt: string;
}

export default function BearHabitat({
  description,
  imageSrc,
  imageAlt,
}: BearHabitatProps): ReactElement {
  return (
    <>
      <p>{description}</p>
      <img src={imageSrc} alt={imageAlt} />
    </>
  );
}
