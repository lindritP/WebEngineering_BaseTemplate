export default interface Bear {
  id: string;
  name: string;
  binomial: string;
  imageUrl: string | null;
  range: string;
}

export interface Comment {
  name: string;
  comment: string;
}

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
