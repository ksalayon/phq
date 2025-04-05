import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BookmarksState } from './bookmarks.reducer';
import { Bookmark } from '../models/bookmark';

export const selectBookmarksState = createFeatureSelector<BookmarksState>('bookmarks');

export const selectAllBookmarks = createSelector(
  selectBookmarksState,
  (state) =>
    Object.values(state.entities)
      .filter((bookmark): bookmark is Bookmark => !!bookmark)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) as Bookmark[]
);

// export const selectBookmarkGroups = createSelector(selectBookmarksState, (state) => state.groups);

export const selectLoading = createSelector(selectBookmarksState, (state) => state.loading);
export const selectError = createSelector(selectBookmarksState, (state) => state.error);
export const selectIsSubmitting = createSelector(
  selectBookmarksState,
  (state) => state.isSubmitting
);
