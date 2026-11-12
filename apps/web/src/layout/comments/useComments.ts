import { useEffect, useState } from 'react';
import {
  createComment,
  deleteComment,
  fetchComments,
} from '../../api/comments.ts';
import { errorMessage } from '../../api/problem.ts';
import type { CommentsState, NewComment } from '../../types.ts';

export interface UseComments {
  state: CommentsState;
  addComment: (input: NewComment) => Promise<void>;
  removeComment: (commentId: string) => Promise<void>;
}

// Loads the comments of one bear from the API. The list is only updated after
// the API confirmed a change, so the UI never shows a comment the server
// does not have. Callers remount the hook per bear (key), so the initial
// 'loading' state is always correct.
export default function useComments(bearId: string): UseComments {
  const [state, setState] = useState<CommentsState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();

    fetchComments(bearId, controller.signal)
      .then((comments) => {
        setState({ status: 'success', comments });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        console.error('Could not load the comments:', error);
        setState({
          status: 'error',
          message: errorMessage(
            error,
            'Comments could not be loaded. Please try again later.'
          ),
        });
      });

    return () => {
      controller.abort();
    };
  }, [bearId]);

  async function addComment(input: NewComment): Promise<void> {
    const created = await createComment(bearId, input);
    setState((prev) =>
      prev.status === 'success'
        ? { status: 'success', comments: [...prev.comments, created] }
        : prev
    );
  }

  async function removeComment(commentId: string): Promise<void> {
    await deleteComment(commentId);
    setState((prev) =>
      prev.status === 'success'
        ? {
            status: 'success',
            comments: prev.comments.filter(
              (comment) => comment.id !== commentId
            ),
          }
        : prev
    );
  }

  return { state, addComment, removeComment };
}
