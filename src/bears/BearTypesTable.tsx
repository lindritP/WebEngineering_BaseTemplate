import { useId } from 'react';
import type { ReactElement } from 'react';
import Highlight from '../search/Highlight.tsx';
import type { BearType } from '../types.ts';

interface BearTypesTableProps {
  bearTypes: BearType[];
  searchTerm: string;
}

const columns = ['Coat', 'Adult size', 'Habitat', 'Lifespan', 'Diet'];

// <caption> names the table, <th scope="col"> and <th scope="row"> let screen
// readers announce the matching column and row header for every data cell.
export default function BearTypesTable({
  bearTypes,
  searchTerm,
}: BearTypesTableProps): ReactElement {
  const captionId = useId();

  // On narrow screens only the table scrolls sideways, not the whole page.
  // tabIndex makes the scroll area reachable (and scrollable) by keyboard.
  return (
    <div
      className="table-scroll"
      role="region"
      aria-labelledby={captionId}
      tabIndex={0}
    >
      <table>
        <caption id={captionId}>
          <Highlight
            text="Wild and urban bears compared by coat, adult size, habitat, lifespan and diet"
            query={searchTerm}
          />
        </caption>
        <thead>
          <tr>
            <th scope="col">
              <Highlight text="Bear Type" query={searchTerm} />
            </th>
            {columns.map((column) => (
              <th key={column} scope="col">
                <Highlight text={column} query={searchTerm} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bearTypes.map((bearType) => (
            <tr key={bearType.type}>
              <th scope="row">
                <Highlight text={bearType.type} query={searchTerm} />
              </th>
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
    </div>
  );
}
