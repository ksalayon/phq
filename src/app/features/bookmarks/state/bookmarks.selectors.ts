import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BookmarksState } from './bookmarks.reducer';

export const selectBookmarksState = createFeatureSelector<BookmarksState>('bookmarks');

export const selectAllBookmarks = createSelector(selectBookmarksState, (state) => state);

// export const selectBookmarkGroups = createSelector(selectBookmarksState, (state) => state.groups);

export const selectLoading = createSelector(selectBookmarksState, (state) => state.loading);
export const selectError = createSelector(selectBookmarksState, (state) => state.error);
