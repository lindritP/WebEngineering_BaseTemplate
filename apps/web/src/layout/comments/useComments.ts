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
  // Appends the next (older) page; rejects if the request fails.
  loadMore: () => Promise<void>;
}

// Loads the comments of one bear from the API, one page at a time (newest
// first). The list is only updated after
// the API confirmed a change, so the UI never shows a comment the server
// does not have. Callers remount the hook per bear (key), so the initial
// 'loading' state is always correct.
export default function useComments(bearId: string): UseComments {
  const [state, setState] = useState<CommentsState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();

    fetchComments(bearId, controller.signal)
      .then(({ items, nextCursor }) => {
        setState({ status: 'success', comments: items, nextCursor });
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
        ? { ...prev, comments: [created, ...prev.comments] }
        : prev
    );
  }

  async function removeComment(commentId: string): Promise<void> {
    await deleteComment(commentId);
    setState((prev) =>
      prev.status === 'success'
        ? {
            ...prev,
            comments: prev.comments.filter(
              (comment) => comment.id !== commentId
            ),
          }
        : prev
    );
  }

  async function loadMore(): Promise<void> {
    if (state.status !== 'success' || state.nextCursor === null) {
      return;
    }
    const page = await fetchComments(
      bearId,
      new AbortController().signal,
      state.nextCursor
    );
    // A keyset cursor does not move when comments are added or deleted
    // meanwhile, so the new page continues exactly where the list ends.
    setState((prev) =>
      prev.status === 'success'
        ? {
            status: 'success',
            comments: [...prev.comments, ...page.items],
            nextCursor: page.nextCursor,
          }
        : prev
    );
  }

  return { state, addComment, removeComment, loadMore };
}
