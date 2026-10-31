import { useId, useState } from 'react';
import type { ReactElement, SubmitEvent } from 'react';
import type { Comment } from '../../types.ts';

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (comment: Comment) => void;
}

export default function CommentSection({
  comments,
  onAddComment,
}: CommentSectionProps): ReactElement {
  const [name, setName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const nameId = useId();
  const commentId = useId();
  const errorId = useId();

  // Derived from the inputs, so the error disappears as soon as it is fixed.
  const nameMissing = name.trim() === '';
  const commentMissing = commentText.trim() === '';
  const showError = submitAttempted && (nameMissing || commentMissing);
  const [firstComment] = comments;

  function handleSubmit(e: SubmitEvent<HTMLFormElement>): void {
    e.preventDefault();

    if (nameMissing || commentMissing) {
      setSubmitAttempted(true);
      return;
    }

    const newComment: Comment = {
      name: name.trim(),
      comment: commentText.trim(),
    };

    onAddComment(newComment);
    setName('');
    setCommentText('');
    setSubmitAttempted(false);
  }

  return (
    <div className="comment-wrapper">
      <h4>Add comment</h4>
      {/* noValidate: our own message below replaces the browser's bubble, so
          whitespace-only input gets the same accessible feedback. */}
      <form className="comment-form" onSubmit={handleSubmit} noValidate>
        {/* The live region is always rendered, so screen readers announce
            the message when its text appears. */}
        <p id={errorId} role="alert" className="form-error">
          {showError ? 'Please fill in both your name and a comment.' : ''}
        </p>
        <div className="flex-pair">
          <label htmlFor={nameId}>Your name:</label>
          <input
            id={nameId}
            type="text"
            name="name"
            placeholder="Enter your name"
            required
            aria-invalid={showError && nameMissing}
            aria-describedby={showError ? errorId : undefined}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </div>
        <div className="flex-pair">
          <label htmlFor={commentId}>Your comment:</label>
          <input
            id={commentId}
            type="text"
            name="comment"
            placeholder="Enter your comment"
            required
            aria-invalid={showError && commentMissing}
            aria-describedby={showError ? errorId : undefined}
            value={commentText}
            onChange={(e) => {
              setCommentText(e.target.value);
            }}
          />
        </div>
        <div>
          <input type="submit" value="Submit comment" />
        </div>
      </form>

      <h4>Posted comments</h4>
      {firstComment === undefined ? (
        <p>No comments yet.</p>
      ) : (
        <ul className="comment-container">
          {comments.map((comment, index) => (
            <li key={index}>
              <p>{comment.name}</p>
              <p>{comment.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
