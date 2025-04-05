import { createActionGroup, props } from '@ngrx/store';
import { Bookmark, CreateBookmarkPayload, UpdateBookmarkPayload } from '../models/bookmark';

export const BookmarksActions = createActionGroup({
  source: 'bookmarks',
  events: {
    'Create Bookmark': props<{ payload: CreateBookmarkPayload }>(),
    'Create Bookmark Success': props<{ bookmark: Bookmark }>(),
    'Create Bookmark Failure': props<{ error: string }>(),
    'Update Bookmark': props<{ payload: UpdateBookmarkPayload }>(),
    'Update Bookmark Success': props<{ changes: Bookmark }>(),
    'Update Bookmark Failure': props<{ error: string }>(),
  },
});
