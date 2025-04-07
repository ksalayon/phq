import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { BookmarksActions } from './bookmarks.actions';
import { Bookmark } from '../models/bookmark';
import { BookmarksUtils } from '../utils/bookmark.util';

export const bookmarksFeatureKey = 'bookmarks';

export interface BookmarksState extends EntityState<Bookmark> {
  error: string | null;
  loading: boolean;
  isSubmitting: boolean;
  totalCount: number;
  currentPage: {
    pageIndex: number;
    pageSize: number;
  };
}

export const bookmarksAdapter: EntityAdapter<Bookmark> = createEntityAdapter<Bookmark>({
  sortComparer: BookmarksUtils.compareByDates,
  selectId: (bookmark) => bookmark.id, // Explicitly set the `id` field as the key
});
export const initialState: BookmarksState = bookmarksAdapter.getInitialState({
  error: null,
  loading: false,
  isSubmitting: false,
  totalCount: 0,
  currentPage: {
    pageIndex: 0,
    pageSize: 20,
  },
});

export const bookmarksReducer = createReducer(
  initialState,

  // Load Bookmarks (All)
  on(BookmarksActions.loadBookmarks, (state) => ({ ...state, loading: true })),
  on(BookmarksActions.loadBookmarksSuccess, (state, { bookmarks, totalCount }) => {
    return bookmarksAdapter.setAll(bookmarks, {
      ...state,
      totalCount, // Ensure this updates correctly
      loading: false,
      error: null,
    });
  }),
  on(BookmarksActions.loadBookmarksFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Load Bookmark (one)
  on(BookmarksActions.loadBookmark, (state) => ({ ...state, loading: true })),
  on(BookmarksActions.loadBookmarkSuccess, (state, { bookmark }) =>
    bookmarksAdapter.upsertOne(bookmark, { ...state, loading: false, error: null })
  ),
  on(BookmarksActions.loadBookmarkFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Create Bookmark
  on(BookmarksActions.createBookmark, (state, { payload }) => {
    return {
      ...state,
      loading: true,
      isSubmitting: true,
      error: null,
    };
  }),
  on(BookmarksActions.createBookmarkSuccess, (state, { bookmark }) => {
    return {
      ...bookmarksAdapter.addOne(bookmark, state),
      loading: false, // Ensure loading and isSubmitting flags are reset to false after success
      isSubmitting: false,
      totalCount: state.totalCount + 1,
      error: null,
    };
  }),
  on(BookmarksActions.createBookmarkFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
    isSubmitting: false,
  })),

  // Update Bookmark
  on(BookmarksActions.updateBookmark, (state, { payload }) => {
    return {
      ...state,
      loading: true,
      isSubmitting: true,
      error: null,
    };
  }),
  on(BookmarksActions.updateBookmarkSuccess, (state, { changes }) => {
    return {
      ...bookmarksAdapter.updateOne({ id: changes.id, changes }, state),
      loading: false, // Ensure loading and isSubmitting flags are reset to false after success
      isSubmitting: false,
      error: null,
    };
  }),
  on(BookmarksActions.updateBookmarkFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
    isSubmitting: false,
  })),

  // Delete Bookmark
  on(BookmarksActions.deleteBookmark, (state, { id }) => {
    return {
      ...state,
      loading: true,
      isSubmitting: true,
      error: null,
    };
  }),
  on(BookmarksActions.deleteBookmarkSuccess, (state, { id }) => {
    return {
      ...bookmarksAdapter.removeOne(id, state),
      loading: false, // Ensure loading and isSubmitting flags are reset to false after success
      isSubmitting: false,
      totalCount: state.totalCount - 1,
      error: null,
    };
  }),
  on(BookmarksActions.deleteBookmarkFailure, (state, { error }) => {
    return {
      ...state,
      loading: false,
      isSubmitting: false,
      error,
    };
  }),
  on(BookmarksActions.saveCurrentPageState, (state, { pageIndex, pageSize }) => ({
    ...state,
    currentPage: {
      pageIndex,
      pageSize,
    },
  }))
);
