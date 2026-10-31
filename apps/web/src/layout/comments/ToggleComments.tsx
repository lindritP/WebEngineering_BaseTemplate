import { useId, useState } from 'react';
import type { ReactElement } from 'react';
import type { Comment } from '../../types.ts';
import CommentSection from './CommentSection.tsx';

export default function ToggleComments(): ReactElement {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const headingId = useId();
  const panelId = useId();

  function handleAddComment(newComment: Comment): void {
    setComments((prevComments) => [...prevComments, newComment]);
  }

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
      <div id={panelId}>
        {open && (
          <CommentSection comments={comments} onAddComment={handleAddComment} />
        )}
      </div>
    </section>
  );
}
