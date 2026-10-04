import type { ReactElement } from 'react';
import type Bear from '../types.ts';

interface BearCardProps {
  bear: Bear;
}

export default function BearCard({ bear }: BearCardProps): ReactElement {
  return (
    <div
      className="bear"
      style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}
    >
      <img
        src={bear.image}
        alt={`Image of ${bear.name}`}
        style={{ width: '200px', height: 'auto' }}
      ></img>
      <p>
        <b>{bear.name}</b> ({bear.binomial})
      </p>
      <p>Range: {bear.range}</p>
    </div>
  );
}
