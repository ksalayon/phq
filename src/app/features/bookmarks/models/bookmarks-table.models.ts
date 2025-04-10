import { Bookmark } from './bookmark';

export interface VMBookmark extends Omit<Bookmark, 'createdAt' | 'modifiedAt'> {
  createdAt: string; // A more user-friendly format for createdAt
  modifiedAt?: string; // A more user-friendly format for modifiedAt
}

export const FIRST_PAGE_INDEX = 0;
export const DEFAULT_PAGE_SIZE = 20;
export const SEARCH_DEBOUNCE_TIME = 700;
export const MIN_SEARCH_LENGTH = 3;
