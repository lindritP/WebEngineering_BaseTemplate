import { useId, useState } from 'react';
import type { ReactElement } from 'react';
import CommentSection from './CommentSection.tsx';

interface ToggleCommentsProps {
  bearId: string;
}

export default function ToggleComments({
  bearId,
}: ToggleCommentsProps): ReactElement {
  const [open, setOpen] = useState(false);
  const headingId = useId();
  const panelId = useId();

  return (
    <section className="comments" aria-labelledby={headingId}>
      <h3 id={headingId} className="heading-md">
        Comments
      </h3>
      {/* A real <button> is focusable with Tab and activated with Enter or
          Space; aria-expanded tells screen readers whether the panel is open. */}
      <button
        type="button"
        className="show-hide"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          setOpen((prevOpen) => !prevOpen);
        }}
      >
        {open ? 'Hide comments' : 'Show comments'}
      </button>
      {/* The comments are only requested once the panel is opened. */}
      <div id={panelId}>{open && <CommentSection bearId={bearId} />}</div>
    </section>
  );
}
