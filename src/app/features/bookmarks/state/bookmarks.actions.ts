import { createActionGroup, props } from '@ngrx/store';
import { Bookmark, CreateBookmarkPayload, UpdateBookmarkPayload } from '../models/bookmark';

/**
 * BookmarksActions is a collection of actions used within a bookmarking application context.
 * Each action represents a specific operation that can be performed on bookmarks,
 * such as loading, creating, updating, or deleting bookmarks, along with handling
 * their respective success or failure states.
 */
export const BookmarksActions = createActionGroup({
  source: 'bookmarks',
  events: {
    'Load Bookmark': props<{ id: Bookmark['id'] }>(),
    'Load Bookmark Success': props<{ bookmark: Bookmark }>(),
    'Load Bookmark Failure': props<{ error: string }>(),
    'Create Bookmark': props<{ payload: CreateBookmarkPayload }>(),
    'Create Bookmark Success': props<{ bookmark: Bookmark }>(),
    'Create Bookmark Failure': props<{ error: string }>(),
    'Update Bookmark': props<{ payload: UpdateBookmarkPayload }>(),
    'Update Bookmark Success': props<{ changes: Bookmark }>(),
    'Update Bookmark Failure': props<{ error: string }>(),
    'Delete Bookmark': props<{ id: Bookmark['id'] }>(),
    'Delete Bookmark Success': props<{ id: Bookmark['id'] }>(),
    'Delete Bookmark Failure': props<{ error: string }>(),
  },
});
