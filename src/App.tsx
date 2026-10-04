import type { ReactElement } from 'react';
import { ToggleComments } from './comment.tsx';

export default function App(): ReactElement {
  return (
    <div>
      <ToggleComments />
    </div>
  );
}
