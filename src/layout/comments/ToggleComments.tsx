import { useState } from 'react';
import type { ReactElement } from 'react';
import type { Comment } from '../../types.ts';
import CommentSection from './CommentSection.tsx';

export default function ToggleComments(): ReactElement {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);

  function handleAddComment(newComment: Comment): void {
    setComments((prevComments) => [...prevComments, newComment]);
  }
  return (
    <section className="comments">
      <button
        onClick={() => {
          setOpen((prevOpen) => !prevOpen);
        }}
      >
        {open ? 'Hide comments' : 'Show comments'}
      </button>
      {open && (
        <CommentSection comments={comments} onAddComment={handleAddComment} />
      )}
    </section>
  );
}
