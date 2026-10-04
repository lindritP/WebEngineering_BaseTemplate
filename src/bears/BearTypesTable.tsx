import type { ReactElement } from 'react';
import Highlight from '../search/Highlight.tsx';
import type { BearType } from '../types.ts';

interface BearTypesTableProps {
  bearTypes: BearType[];
  searchTerm: string;
}

export default function BearTypesTable({
  bearTypes,
  searchTerm,
}: BearTypesTableProps): ReactElement {
  return (
    <table>
      <thead>
        <tr>
          <td>
            <Highlight text="Bear Type" query={searchTerm} />
          </td>
          <td>
            <Highlight text="Coat" query={searchTerm} />
          </td>
          <td>
            <Highlight text="Adult size" query={searchTerm} />
          </td>
          <td>
            <Highlight text="Habitat" query={searchTerm} />
          </td>
          <td>
            <Highlight text="Lifespan" query={searchTerm} />
          </td>
          <td>
            <Highlight text="Diet" query={searchTerm} />
          </td>
        </tr>
      </thead>
      <tbody>
        {bearTypes.map((bearType) => (
          <tr key={bearType.type}>
            <td>
              <Highlight text={bearType.type} query={searchTerm} />
            </td>
            <td>
              <Highlight text={bearType.coat} query={searchTerm} />
            </td>
            <td>
              <Highlight text={bearType.adultSize} query={searchTerm} />
            </td>
            <td>
              <Highlight text={bearType.habitat} query={searchTerm} />
            </td>
            <td>
              <Highlight text={bearType.lifespan} query={searchTerm} />
            </td>
            <td>
              <Highlight text={bearType.diet} query={searchTerm} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
