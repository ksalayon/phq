import { Bookmark } from '../../models/bookmark';

export interface VMBookmark extends Omit<Bookmark, 'createdAt' | 'modifiedAt'> {
  createdAt: string; // A more user-friendly format for createdAt
  modifiedAt: string; // A more user-friendly format for modifiedAt
}
