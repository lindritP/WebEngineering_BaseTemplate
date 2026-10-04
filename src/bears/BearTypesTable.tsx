import type { ReactElement } from 'react';
import type { BearType } from '../types.ts';

interface BearTypesTableProps {
  bearTypes: BearType[];
}

export default function BearTypesTable({
  bearTypes,
}: BearTypesTableProps): ReactElement {
  return (
    <table>
      <thead>
        <tr>
          <td>Bear Type</td>
          <td>Coat</td>
          <td>Adult size</td>
          <td>Habitat</td>
          <td>Lifespan</td>
          <td>Diet</td>
        </tr>
      </thead>
      <tbody>
        {bearTypes.map((bearType) => (
          <tr key={bearType.type}>
            <td>{bearType.type}</td>
            <td>{bearType.coat}</td>
            <td>{bearType.adultSize}</td>
            <td>{bearType.habitat}</td>
            <td>{bearType.lifespan}</td>
            <td>{bearType.diet}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
