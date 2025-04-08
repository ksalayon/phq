/* eslint-disable @typescript-eslint/member-ordering */
// Need to override the 'member-ordering' lint rule or the inject() method for doing DI in Angular will show an error
// This is specially important for the effects file where if Actions was injected after the actual created effect method, the
// action$ will be undefined and will throw an error when the Effect is initialized at provideEffects()

import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, switchMap, take } from 'rxjs/operators';
import { BookmarksActions } from './bookmarks.actions';
import { BookmarkService } from '../services/bookmark.service';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectAllBookmarks } from './bookmarks.selectors';
import { BookmarkStateService } from '../services/bookmark-state.service';

@Injectable()
export class BookmarksEffects {
  private actions$ = inject(Actions);
  private bookmarkService = inject(BookmarkService);
  private store = inject(Store);
  private bookmarkStateService = inject(BookmarkStateService);

  /**
   * Effect to load a bookmark by its ID.
   *
   * it triggers a side effect to fetch the specific bookmark from the `BookmarkService` using the provided ID.
   *
   * On a successful response:
   * - If the bookmark exists, it dispatches the `loadBookmarkSuccess` action with the fetched bookmark.
   * - If the bookmark does not exist or if there is an error during the request, it dispatches the `loadBookmarkFailure` action with an appropriate error message.
   */
  loadBookmark$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.loadBookmark),
      switchMap(({ id }) =>
        this.bookmarkService.getBookmark(id).pipe(
          map((bookmark) => {
            if (!bookmark) {
              return BookmarksActions.loadBookmarkFailure({ error: 'The bookmark does not exist' });
            }
            return BookmarksActions.loadBookmarkSuccess({ bookmark });
          }),
          catchError((error) => of(BookmarksActions.loadBookmarkFailure({ error: error.message })))
        )
      )
    )
  );

  /**
   * Effect to load all bookmarks
   */
  loadBookmarks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.loadBookmarks),
      switchMap(({ startIndex, limit }) => {
        return this.bookmarkService.getBookmarksPaginated(startIndex, limit).pipe(
          mergeMap((bookmarks) => {
            return this.bookmarkService.getBookmarksCount().pipe(
              map((totalCount) => {
                return BookmarksActions.loadBookmarksSuccess({ bookmarks, totalCount });
              })
            );
          }),
          catchError((error) => {
            return of(BookmarksActions.loadBookmarksFailure({ error: error.message }));
          })
        );
      })
    )
  );

  // Effect for Search Bookmarks By Url
  searchBookmarksByUrl$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.searchBookmarksByUrl),
      switchMap(({ urlQuery, startIndex, limit }) => {
        return this.bookmarkService.searchBookmarksByUrl(urlQuery, startIndex, limit).pipe(
          map((bookmarks) => BookmarksActions.searchBookmarksByUrlSuccess({ bookmarks })),
          catchError((error) =>
            of(BookmarksActions.searchBookmarksByUrlFailure({ error: error.message }))
          )
        );
      })
    )
  );

  // Effect for Get Bookmark Search Result Count
  getBookmarkSearchResultCount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.getBookmarkSearchResultCount),
      switchMap(({ search }) =>
        this.bookmarkService.getBookmarkSearchResultCount(search).pipe(
          map((count) => BookmarksActions.getBookmarkSearchResultCountSuccess({ count })),
          catchError((error) =>
            of(BookmarksActions.getBookmarkSearchResultCountFailure({ error: error.message }))
          )
        )
      )
    )
  );

  /**
   * Effect to handle the creation of a bookmark.
   * It first checks whether a bookmark with the same URL already exists in the store. If a duplicate URL is found,
   * the effect will emit a `BookmarksActions.createBookmarkFailure` action with an appropriate error message.
   *
   * If no duplicate is found, then it saves it into the store
   */
  createBookmark$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.createBookmark),
      mergeMap((action) =>
        this.store.select(selectAllBookmarks).pipe(
          take(1), // ensure it completes
          mergeMap((bookmarks) => {
            // Check to disallow creation if the url already exists
            const bookmarkExists = bookmarks.some(
              (bookmark) => bookmark.url === action.payload.url
            );

            if (bookmarkExists) {
              const errorMessage = 'Bookmark with the same URL already exists';
              this.bookmarkStateService.signalSubmissionError(errorMessage);
              return of(
                BookmarksActions.createBookmarkFailure({
                  error: errorMessage,
                })
              );
            }

            return this.bookmarkService.createBookmark(action.payload).pipe(
              map((bookmark) => {
                this.bookmarkStateService.signalSubmissionSuccess(bookmark.id);
                return BookmarksActions.createBookmarkSuccess({ bookmark });
              }),
              catchError((error) => {
                const errorMessage = error?.message || 'Bookmark creation failed';
                this.bookmarkStateService.signalSubmissionError(errorMessage);

                return of(
                  BookmarksActions.createBookmarkFailure({
                    error: errorMessage,
                  })
                );
              })
            );
          })
        )
      )
    )
  );

  /**
   * Effect to handle the update of a bookmark in the application state.
   *
   * Listens for the `updateBookmark` action and processes the update via bookmarkService.updateBookmark
   * bookmarkService.updateBookmark ensures that the bookmark's URL is
   * unique (except when editing and retaining the same URL). If a bookmark with the same URL already exists
   * under a different ID, an error is thrown from the service and is appropriately handled it to update the store with the error
   * enabling clients (i.e. components) to handle and present that error if needed
   *
   */
  updateBookmark$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.updateBookmark),
      mergeMap((action) => {
        return this.bookmarkService.updateBookmark(action.payload).pipe(
          map((bookmark) => {
            this.bookmarkStateService.signalSubmissionSuccess(bookmark.id);
            return BookmarksActions.updateBookmarkSuccess({ changes: bookmark });
          }),
          catchError((error) => {
            const errorMessage = error?.message || 'Bookmark update failed';
            this.bookmarkStateService.signalSubmissionError(errorMessage);
            return of(
              BookmarksActions.updateBookmarkFailure({
                error: error?.message || 'Bookmark update failed',
              })
            );
          })
        );
      })
    )
  );

  /**
   * Effect to handle the deletion of a bookmark, deleting a bookmark based on the provided `id`.
   *
   * Upon successful deletion, it dispatches a `deleteBookmarkSuccess` action
   * containing the id of the deleted bookmark. If the deletion fails,
   * it dispatches a `deleteBookmarkFailure` action with an error message.
   *
   */
  deleteBookmark$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.deleteBookmark),
      mergeMap(({ id }) =>
        this.bookmarkService.deleteBookmark(id).pipe(
          map(() => {
            this.bookmarkStateService.signalSubmissionSuccess(id);
            return BookmarksActions.deleteBookmarkSuccess({ id });
          }),
          catchError(() => {
            const errorMessage = 'Bookmark deletion failed';
            // TODO: Log to Raygun
            this.bookmarkStateService.signalSubmissionError(errorMessage);
            return of(
              BookmarksActions.deleteBookmarkFailure({
                error: 'Bookmark deletion failed',
              })
            );
          })
        )
      )
    )
  );
}
