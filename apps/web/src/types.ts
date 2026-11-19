export default interface Bear {
  id: string;
  name: string;
  binomial: string;
  imageUrl: string | null;
  range: string;
}

// A comment as the API returns it: id, bearId and createdAt come from the server.
export interface Comment {
  id: string;
  bearId: string;
  author: string;
  text: string;
  createdAt: string;
}

// What the form sends to the API.
export interface NewComment {
  author: string;
  text: string;
}

// One page of comments. nextCursor is null when there is nothing more to load.
export interface CommentPage {
  items: Comment[];
  nextCursor: string | null;
}

export type CommentsState =
  | { status: 'loading' }
  | { status: 'success'; comments: Comment[]; nextCursor: string | null }
  | { status: 'error'; message: string };

export interface BearType {
  type: string;
  coat: string;
  adultSize: string;
  habitat: string;
  lifespan: string;
  diet: string;
}

export type BearsState =
  | { status: 'loading' }
  | { status: 'success'; bears: Bear[] }
  | { status: 'empty' }
  | { status: 'error'; message: string };
