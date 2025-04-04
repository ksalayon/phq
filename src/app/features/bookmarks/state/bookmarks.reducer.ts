import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import * as BookmarksActions from './bookmarks.actions';
import { Bookmark } from '../models/bookmark';

export interface BookmarksState extends EntityState<Bookmark> {
  error: string | null;
  loading: boolean;
}

export const bookmarksAdapter: EntityAdapter<Bookmark> = createEntityAdapter<Bookmark>();

export const initialState: BookmarksState = bookmarksAdapter.getInitialState({
  error: null,
  loading: false,
});

export const bookmarksReducer = createReducer(
  initialState,

  // Load Bookmarks
  on(BookmarksActions.loadBookmarks, (state) => ({ ...state, loading: true })),
  on(BookmarksActions.loadBookmarksSuccess, (state, { bookmarks }) =>
    bookmarksAdapter.setAll(bookmarks, { ...state, loading: false, error: null })
  ),
  on(BookmarksActions.loadBookmarksFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Create Bookmark
  on(BookmarksActions.createBookmarkSuccess, (state, { bookmark }) =>
    bookmarksAdapter.addOne(bookmark, state)
  ),
  on(BookmarksActions.createBookmarkFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  // Update Bookmark
  on(BookmarksActions.updateBookmarkSuccess, (state, { id, changes }) =>
    bookmarksAdapter.updateOne({ id, changes }, state)
  ),
  on(BookmarksActions.updateBookmarkFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  // Delete Bookmark
  on(BookmarksActions.deleteBookmarkSuccess, (state, { id }) =>
    bookmarksAdapter.removeOne(id, state)
  ),
  on(BookmarksActions.deleteBookmarkFailure, (state, { error }) => ({
    ...state,
    error,
  }))
);
