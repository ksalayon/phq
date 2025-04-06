import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { BookmarksActions } from './bookmarks.actions';
import { Bookmark } from '../models/bookmark';
import { sampleBookmarks } from '../utils/bookmarks.sample-data.util';
import { BookmarksUtils } from '../utils/bookmark.util';

export const bookmarksFeatureKey = 'bookmarks';

export interface BookmarksState extends EntityState<Bookmark> {
  error: string | null;
  loading: boolean;
  isSubmitting: boolean;
}

export const bookmarksAdapter: EntityAdapter<Bookmark> = createEntityAdapter<Bookmark>({
  sortComparer: BookmarksUtils.compareByDates,
  selectId: (bookmark) => bookmark.id, // Explicitly set the `id` field as the key
});
export const initialState: BookmarksState = bookmarksAdapter.getInitialState({
  ...bookmarksAdapter.addMany(sampleBookmarks, bookmarksAdapter.getInitialState()),
  error: null,
  loading: false,
  isSubmitting: false,
});

export const bookmarksReducer = createReducer(
  initialState,

  // Load Bookmarks
  // on(BookmarksActions.loadBookmarks, (state) => ({ ...state, loading: true })),
  // on(BookmarksActions.loadBookmarksSuccess, (state, { bookmarks }) =>
  //   bookmarksAdapter.setAll(bookmarks, { ...state, loading: false, error: null })
  // ),
  // on(BookmarksActions.loadBookmarksFailure, (state, { error }) => ({
  //   ...state,
  //   loading: false,
  //   error,
  // })),

  // Create Bookmark
  on(BookmarksActions.createBookmark, (state, { payload }) => {
    console.log('BookmarksActions.createBookmark', payload);
    return {
      ...state,
      loading: true,
      isSubmitting: true,
      error: null,
    };
  }),
  on(BookmarksActions.createBookmarkSuccess, (state, { bookmark }) => {
    console.log('createBookmarkSuccess$', bookmark);
    return {
      ...bookmarksAdapter.addOne(bookmark, state),
      loading: false, // Ensure loading and isSubmitting flags are reset to false after success
      isSubmitting: false,
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
      ...bookmarksAdapter.updateOne(
        { id: changes.id, changes: { ...changes, modifiedAt: new Date() } }, // update modifiedAt to current time
        state
      ),
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
  })
);
