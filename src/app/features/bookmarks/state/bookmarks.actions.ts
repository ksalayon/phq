import { createAction, props } from '@ngrx/store';
import { Bookmark, BookmarkGroup, UpdateBookmarkPayload } from '../models/bookmark';

// Actions for Bookmark CRUD
export const loadBookmarks = createAction('[Bookmarks] Load Bookmarks');
export const loadBookmarksSuccess = createAction(
  '[Bookmarks] Load Bookmarks Success',
  props<{ bookmarks: Bookmark[] }>()
);
export const loadBookmarksFailure = createAction(
  '[Bookmarks] Load Bookmarks Failure',
  props<{ error: string }>()
);

export const createBookmark = createAction(
  '[Bookmarks] Create Bookmark',
  props<{ bookmark: Bookmark }>()
);
export const createBookmarkSuccess = createAction(
  '[Bookmarks] Create Bookmark Success',
  props<{ bookmark: Bookmark }>()
);
export const createBookmarkFailure = createAction(
  '[Bookmarks] Create Bookmark Failure',
  props<{ error: string }>()
);

export const updateBookmark = createAction(
  '[Bookmarks] Update Bookmark',
  props<{ id: Bookmark['id']; changes: UpdateBookmarkPayload }>()
);
export const updateBookmarkSuccess = createAction(
  '[Bookmarks] Update Bookmark Success',
  props<{ id: Bookmark['id']; changes: UpdateBookmarkPayload }>()
);
export const updateBookmarkFailure = createAction(
  '[Bookmarks] Update Bookmark Failure',
  props<{ error: string }>()
);

export const deleteBookmark = createAction('[Bookmarks] Delete Bookmark', props<{ id: string }>());
export const deleteBookmarkSuccess = createAction(
  '[Bookmarks] Delete Bookmark Success',
  props<{ id: Bookmark['id'] }>()
);
export const deleteBookmarkFailure = createAction(
  '[Bookmarks] Delete Bookmark Failure',
  props<{ error: Bookmark['id'] }>()
);

// Actions for BookmarkGroup CRUD
export const loadBookmarkGroups = createAction('[Bookmark Groups] Load Groups');
export const loadBookmarkGroupsSuccess = createAction(
  '[Bookmark Groups] Load Groups Success',
  props<{ groups: BookmarkGroup[] }>()
);
export const loadBookmarkGroupsFailure = createAction(
  '[Bookmark Groups] Load Groups Failure',
  props<{ error: string }>()
);

export const createBookmarkGroup = createAction(
  '[Bookmark Groups] Create Group',
  props<{ group: BookmarkGroup }>()
);
export const createBookmarkGroupSuccess = createAction(
  '[Bookmark Groups] Create Group Success',
  props<{ group: BookmarkGroup }>()
);
export const createBookmarkGroupFailure = createAction(
  '[Bookmark Groups] Create Group Failure',
  props<{ error: string }>()
);

export const updateBookmarkGroup = createAction(
  '[Bookmark Groups] Update Group',
  props<{ id: BookmarkGroup['id']; changes: Partial<BookmarkGroup> }>()
);
export const updateBookmarkGroupSuccess = createAction(
  '[Bookmark Groups] Update Group Success',
  props<{ group: BookmarkGroup }>()
);
export const updateBookmarkGroupFailure = createAction(
  '[Bookmark Groups] Update Group Failure',
  props<{ error: string }>()
);

export const deleteBookmarkGroup = createAction(
  '[Bookmark Groups] Delete Group',
  props<{ id: BookmarkGroup['id'] }>()
);
export const deleteBookmarkGroupSuccess = createAction(
  '[Bookmark Groups] Delete Group Success',
  props<{ id: BookmarkGroup['id'] }>()
);
export const deleteBookmarkGroupFailure = createAction(
  '[Bookmark Groups] Delete Group Failure',
  props<{ error: string }>()
);
