import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { BookmarksActions } from './bookmarks.actions';
import { Bookmark } from '../models/bookmark';
import { sampleBookmarks } from '../components/bookmarks-table/bookmarks.sample-data';

export const bookmarksFeatureKey = 'bookmarks';

export interface BookmarksState extends EntityState<Bookmark> {
  error: string | null;
  loading: boolean;
  isSubmitting: boolean;
}

export const bookmarksAdapter: EntityAdapter<Bookmark> = createEntityAdapter<Bookmark>({
  sortComparer: (a, b) => b.createdAt.getTime() - a.createdAt.getTime(), // DESC order
});
export const initialState: BookmarksState = bookmarksAdapter.getInitialState({
  entities: sampleBookmarks,
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
  }))

  // Update Bookmark
  // on(BookmarksActions.updateBookmarkSuccess, (state, { changes }) =>
  //   bookmarksAdapter.updateOne({ id: changes.id, changes }, state)
  // ),
  // on(BookmarksActions.updateBookmarkFailure, (state, { error }) => ({
  //   ...state,
  //   error,
  // })),
  //
  // // Delete Bookmark
  // on(BookmarksActions.deleteBookmarkSuccess, (state, { id }) =>
  //   bookmarksAdapter.removeOne(id, state)
  // ),
  // on(BookmarksActions.deleteBookmarkFailure, (state, { error }) => ({
  //   ...state,
  //   error,
  // }))
);
