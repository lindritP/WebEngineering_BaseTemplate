import { useId, useState } from 'react';
import type { ReactElement, SubmitEvent } from 'react';
import type { Comment, CommentsState, NewComment } from '../../types.ts';
import useComments from './useComments.ts';

// Same limits as the API's zod schema, so the browser stops typing where the
// server would answer 400.
const AUTHOR_MAX_LENGTH = 50;
const TEXT_MAX_LENGTH = 1000;

interface CommentSectionProps {
  bearId: string;
}

export default function CommentSection({
  bearId,
}: CommentSectionProps): ReactElement {
  const { state, addComment, removeComment } = useComments(bearId);

  return (
    <div className="comment-wrapper">
      <h4>Add comment</h4>
      <CommentForm onSubmit={addComment} />

      <h4>Posted comments</h4>
      <CommentList state={state} onDelete={removeComment} />
    </div>
  );
}

interface CommentFormProps {
  onSubmit: (input: NewComment) => Promise<void>;
}

function CommentForm({ onSubmit }: CommentFormProps): ReactElement {
  const [name, setName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const nameId = useId();
  const commentId = useId();
  const errorId = useId();

  // Derived from the inputs, so the error disappears as soon as it is fixed.
  const nameMissing = name.trim() === '';
  const commentMissing = commentText.trim() === '';
  const showError = submitAttempted && (nameMissing || commentMissing);
  const errorMessage = showError
    ? 'Please fill in both your name and a comment.'
    : submitError;

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();

    if (nameMissing || commentMissing) {
      setSubmitAttempted(true);
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      await onSubmit({ author: name.trim(), text: commentText.trim() });
      // Only cleared after the API saved the comment: on failure the user
      // keeps the text and can simply submit again.
      setName('');
      setCommentText('');
      setSubmitAttempted(false);
    } catch (error) {
      console.error('Could not save the comment:', error);
      setSubmitError('Your comment could not be saved. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    // noValidate: our own message below replaces the browser's bubble, so
    // whitespace-only input gets the same accessible feedback.
    <form
      className="comment-form"
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
      noValidate
    >
      {/* The live region is always rendered, so screen readers announce
          the message when its text appears. */}
      <p id={errorId} role="alert" className="form-error">
        {errorMessage}
      </p>
      <div className="flex-pair">
        <label htmlFor={nameId}>Your name:</label>
        <input
          id={nameId}
          type="text"
          name="name"
          placeholder="Enter your name"
          required
          maxLength={AUTHOR_MAX_LENGTH}
          aria-invalid={showError && nameMissing}
          aria-describedby={errorMessage === '' ? undefined : errorId}
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
          maxLength={TEXT_MAX_LENGTH}
          aria-invalid={showError && commentMissing}
          aria-describedby={errorMessage === '' ? undefined : errorId}
          value={commentText}
          onChange={(e) => {
            setCommentText(e.target.value);
          }}
        />
      </div>
      <div>
        <input
          type="submit"
          value={submitting ? 'Saving…' : 'Submit comment'}
          disabled={submitting}
        />
      </div>
    </form>
  );
}

interface CommentListProps {
  state: CommentsState;
  onDelete: (commentId: string) => Promise<void>;
}

function CommentList({ state, onDelete }: CommentListProps): ReactElement {
  if (state.status === 'loading') {
    return <p role="status">Loading comments…</p>;
  }
  if (state.status === 'error') {
    return <p role="alert">{state.message}</p>;
  }

  const { comments } = state;
  const [firstComment] = comments;
  if (firstComment === undefined) {
    return <p>No comments yet.</p>;
  }

  return (
    <ul className="comment-container">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} onDelete={onDelete} />
      ))}
    </ul>
  );
}

interface CommentItemProps {
  comment: Comment;
  onDelete: (commentId: string) => Promise<void>;
}

function CommentItem({ comment, onDelete }: CommentItemProps): ReactElement {
  const [deleting, setDeleting] = useState(false);
  const [deleteFailed, setDeleteFailed] = useState(false);

  async function handleDelete(): Promise<void> {
    setDeleting(true);
    setDeleteFailed(false);
    try {
      // On success the item disappears from the list and unmounts.
      await onDelete(comment.id);
    } catch (error) {
      console.error('Could not delete the comment:', error);
      setDeleteFailed(true);
      setDeleting(false);
    }
  }

  return (
    <li>
      <p>{comment.author}</p>
      <p>
        {comment.text}
        <time dateTime={comment.createdAt}>
          {new Date(comment.createdAt).toLocaleString()}
        </time>
      </p>
      <button
        type="button"
        className="comment-delete"
        disabled={deleting}
        onClick={() => {
          void handleDelete();
        }}
      >
        Delete
        <span className="visually-hidden"> comment by {comment.author}</span>
      </button>
      <p role="alert" className="comment-error">
        {deleteFailed ? 'Could not delete. Please try again.' : ''}
      </p>
    </li>
  );
}
