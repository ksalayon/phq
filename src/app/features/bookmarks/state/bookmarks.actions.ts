import { createAction, props } from '@ngrx/store';
import { Bookmark, CreateBookmarkPayload, UpdateBookmarkPayload } from '../models/bookmark';

export const BookmarkActionKeys = Object.freeze({
  loadBookmarks: '[Bookmarks] Load Bookmarks',
  loadBookmarksSuccess: '[Bookmarks] Load Bookmarks Success',
  loadBookmarksFailure: '[Bookmarks] Load Bookmarks Failure',

  createBookmark: '[Bookmarks] Create Bookmark',
  createBookmarkSuccess: '[Bookmarks] Create Bookmark Success',
  createBookmarkFailure: '[Bookmarks] Create Bookmark Failure',

  updateBookmark: '[Bookmarks] Update Bookmark',
  updateBookmarkSuccess: '[Bookmarks] Update Bookmark Success',
  updateBookmarkFailure: '[Bookmarks] Update Bookmark Failure',

  deleteBookmark: '[Bookmarks] Delete Bookmark',
  deleteBookmarkSuccess: '[Bookmarks] Delete Bookmark Success',
  deleteBookmarkFailure: '[Bookmarks] Delete Bookmark Failure',
});

// Actions for Bookmark CRUD
export const loadBookmarks = createAction(BookmarkActionKeys.loadBookmarks);
export const loadBookmarksSuccess = createAction(
  BookmarkActionKeys.loadBookmarksSuccess,
  props<{ bookmarks: Bookmark[] }>()
);
export const loadBookmarksFailure = createAction(
  BookmarkActionKeys.loadBookmarksFailure,
  props<{ error: string }>()
);

export const createBookmark = createAction(
  BookmarkActionKeys.createBookmark,
  props<{ payload: CreateBookmarkPayload }>()
);
export const createBookmarkSuccess = createAction(
  BookmarkActionKeys.createBookmarkSuccess,
  props<{ bookmark: Bookmark }>()
);
export const createBookmarkFailure = createAction(
  BookmarkActionKeys.createBookmarkFailure,
  props<{ error: string }>()
);

export const updateBookmark = createAction(
  BookmarkActionKeys.updateBookmark,
  props<{ changes: UpdateBookmarkPayload }>()
);
export const updateBookmarkSuccess = createAction(
  BookmarkActionKeys.updateBookmarkSuccess,
  props<{ changes: UpdateBookmarkPayload }>()
);
export const updateBookmarkFailure = createAction(
  BookmarkActionKeys.updateBookmarkFailure,
  props<{ error: string }>()
);

export const deleteBookmark = createAction(
  BookmarkActionKeys.deleteBookmark,
  props<{ id: string }>()
);
export const deleteBookmarkSuccess = createAction(
  BookmarkActionKeys.deleteBookmarkSuccess,
  props<{ id: Bookmark['id'] }>()
);
export const deleteBookmarkFailure = createAction(
  BookmarkActionKeys.deleteBookmarkFailure,
  props<{ error: Bookmark['id'] }>()
);

export const BookmarksActions = {
  loadBookmarks,
  loadBookmarksSuccess,
  loadBookmarksFailure,
  createBookmark,
  createBookmarkSuccess,
  createBookmarkFailure,
  updateBookmark,
  updateBookmarkSuccess,
  updateBookmarkFailure,
  deleteBookmark,
  deleteBookmarkSuccess,
  deleteBookmarkFailure,
};

// Actions for BookmarkGroup CRUD
// export const loadBookmarkGroups = createAction('[Bookmark Groups] Load Groups');
// export const loadBookmarkGroupsSuccess = createAction(
//   '[Bookmark Groups] Load Groups Success',
//   props<{ groups: BookmarkGroup[] }>()
// );
// export const loadBookmarkGroupsFailure = createAction(
//   '[Bookmark Groups] Load Groups Failure',
//   props<{ error: string }>()
// );
//
// export const createBookmarkGroup = createAction(
//   '[Bookmark Groups] Create Group',
//   props<{ group: BookmarkGroup }>()
// );
// export const createBookmarkGroupSuccess = createAction(
//   '[Bookmark Groups] Create Group Success',
//   props<{ group: BookmarkGroup }>()
// );
// export const createBookmarkGroupFailure = createAction(
//   '[Bookmark Groups] Create Group Failure',
//   props<{ error: string }>()
// );
//
// export const updateBookmarkGroup = createAction(
//   '[Bookmark Groups] Update Group',
//   props<{ id: BookmarkGroup['id']; changes: Partial<BookmarkGroup> }>()
// );
// export const updateBookmarkGroupSuccess = createAction(
//   '[Bookmark Groups] Update Group Success',
//   props<{ group: BookmarkGroup }>()
// );
// export const updateBookmarkGroupFailure = createAction(
//   '[Bookmark Groups] Update Group Failure',
//   props<{ error: string }>()
// );
//
// export const deleteBookmarkGroup = createAction(
//   '[Bookmark Groups] Delete Group',
//   props<{ id: BookmarkGroup['id'] }>()
// );
// export const deleteBookmarkGroupSuccess = createAction(
//   '[Bookmark Groups] Delete Group Success',
//   props<{ id: BookmarkGroup['id'] }>()
// );
// export const deleteBookmarkGroupFailure = createAction(
//   '[Bookmark Groups] Delete Group Failure',
//   props<{ error: string }>()
// );
