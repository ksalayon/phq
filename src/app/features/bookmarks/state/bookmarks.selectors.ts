import { createSelector } from '@ngrx/store';
import { bookmarksAdapter, BookmarksState } from './bookmarks.reducer';

import { Bookmark } from '../models/bookmark';
import { BookmarksUtils } from '../utils/bookmark.util';

// export const selectBookmarksState = createFeatureSelector<BookmarksState>('bookmarks');
export const selectBookmarksState = (state: any) => state.bookmarks;
const { selectAll } = bookmarksAdapter.getSelectors(selectBookmarksState);

export const selectAllBookmarks = createSelector(
  selectBookmarksState,
  (state) =>
    Object.values(state.entities)
      .filter((bookmark): bookmark is Bookmark => !!bookmark)
      .sort(BookmarksUtils.compareByDates) as Bookmark[]
);

// Selector to retrieve a specific bookmark by its ID
export const selectBookmarkById = (id: string) =>
  createSelector(selectAllBookmarks, (bookmarks) =>
    bookmarks.find((bookmark) => bookmark.id === id)
  );

// selector to retrieve a specific bookmark by its url
export const selectBookmarkByUrl = (url: string) =>
  createSelector(selectAllBookmarks, (bookmarks) =>
    bookmarks.find((bookmark) => bookmark.url === url)
  );

export const selectLoading = createSelector(selectBookmarksState, (state) => state.loading);
export const selectError = createSelector(selectBookmarksState, (state) => state.error);
export const selectIsSubmitting = createSelector(
  selectBookmarksState,
  (state) => state.isSubmitting
);

// Select current bookmarks page from state
export const selectCurrentPageBookmarks = (pageIndex: number, pageSize: number) => {
  return createSelector(selectAll, (bookmarks) => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return bookmarks.slice(start, end);
  });
};

export const selectCurrentPage = createSelector(
  selectAll, // Get all entities as an array
  (state: BookmarksState, props: { page: number; pageSize: number }) => props, // Pass the current page and size as props
  (bookmarks, { page, pageSize }) => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return bookmarks.slice(start, end); // Compute the range dynamically
  }
);

// Select total count of bookmarks
export const selectBookmarksTotalCount = createSelector(
  selectBookmarksState,
  (state: BookmarksState) => state.totalCount
);
