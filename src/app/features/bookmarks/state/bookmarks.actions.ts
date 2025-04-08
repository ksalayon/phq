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
    'Load Bookmarks': props<{ startIndex: number; limit: number }>(),
    'Load Bookmarks Success': props<{ bookmarks: Bookmark[]; totalCount: number }>(),
    'Load Bookmarks Failure': props<{ error: string }>(),
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
    'Save Current Page State': props<{ pageIndex: number; pageSize: number }>(),
    'Search Bookmarks By Url': props<{ urlQuery: string; startIndex: number; limit: number }>(),
    'Search Bookmarks By Url Success': props<{ bookmarks: Bookmark[] }>(),
    'Search Bookmarks By Url Failure': props<{ error: string }>(),
    'Get Bookmark Search Result Count': props<{ search: string }>(),
    'Get Bookmark Search Result Count Success': props<{ count: number }>(),
    'Get Bookmark Search Result Count Failure': props<{ error: string }>(),
  },
});
