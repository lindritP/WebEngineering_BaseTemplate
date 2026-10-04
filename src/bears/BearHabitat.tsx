import type { ReactElement } from 'react';
import Highlight from '../search/Highlight.tsx';

interface BearHabitatProps {
  description: string;
  imageSrc: string;
  imageAlt: string;
  searchTerm: string;
}

export default function BearHabitat({
  description,
  imageSrc,
  imageAlt,
  searchTerm,
}: BearHabitatProps): ReactElement {
  return (
    <>
      <p>
        <Highlight text={description} query={searchTerm} />
      </p>
      <img src={imageSrc} alt={imageAlt} />
    </>
  );
}
