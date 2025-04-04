import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createFeature, createReducer, on } from '@ngrx/store';
import { BookmarksActions } from './bookmarks.actions';
import { Bookmark } from '../models/bookmark';

export const bookmarksFeatureKey = 'bookmarks';

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
  on(BookmarksActions.createBookmarkSuccess, (state, { bookmark }) => {
    console.log('createBookmarkSuccess$', bookmark);
    return bookmarksAdapter.addOne(bookmark, state);
  }),
  on(BookmarksActions.createBookmarkFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  // Update Bookmark
  on(BookmarksActions.updateBookmarkSuccess, (state, { changes }) =>
    bookmarksAdapter.updateOne({ id: changes.id, changes }, state)
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

export const bookmarksFeature = createFeature({
  name: bookmarksFeatureKey,
  reducer: bookmarksReducer,
  //selectSelf: (state: any) => state[bookmarksFeatureKey], // optional but nice
});
