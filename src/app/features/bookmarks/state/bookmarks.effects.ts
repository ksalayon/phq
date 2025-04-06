import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, take } from 'rxjs/operators';
import { BookmarksActions } from './bookmarks.actions';
import { BookmarkService } from '../services/bookmark.service';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectAllBookmarks } from './bookmarks.selectors';

@Injectable()
export class BookmarksEffects {
  private actions$ = inject(Actions);
  private bookmarkService = inject(BookmarkService);
  private store = inject(Store);

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
              return of(
                BookmarksActions.createBookmarkFailure({
                  error: 'Bookmark with the same name already exists',
                })
              );
            }

            return this.bookmarkService.createBookmark(action.payload).pipe(
              map((bookmark) => BookmarksActions.createBookmarkSuccess({ bookmark })),
              catchError((error) =>
                of(
                  BookmarksActions.createBookmarkFailure({
                    error: error?.message || 'Bookmark creation failed',
                  })
                )
              )
            );
          })
        )
      )
    )
  );

  /**
   * Effect to handle the update of a bookmark in the application state.
   *
   * Listens for the `updateBookmark` action and processes the update by ensuring the bookmark's URL is
   * unique (except when editing and retaining the same URL). If a bookmark with the same URL already exists
   * under a different ID, the effect dispatches a `createBookmarkFailure` action with an error message.
   *
   * If the URL is unique or unchanged, the effect attempts to update the bookmark through the `bookmarkService`.
   *
   * The effect completes subscriptions to store observables like `selectAllBookmarks` to ensure no memory leaks.
   */
  updateBookmark$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.updateBookmark),
      mergeMap((action) =>
        this.store.select(selectAllBookmarks).pipe(
          take(1), // ensure it completes
          mergeMap((bookmarks) => {
            const bookmarkExists = bookmarks.some(
              (bookmark) =>
                // Only disallow update if the new url matches a url that already exists for another bookmark
                // This allows us to make the editing work even if the user does not change the url
                bookmark.url === action.payload.url && bookmark.id !== action.payload.id
            );

            if (bookmarkExists) {
              return of(
                BookmarksActions.createBookmarkFailure({
                  error: 'Bookmark with the same name already exists',
                })
              );
            }

            return this.bookmarkService.updateBookmark(action.payload).pipe(
              map((bookmark) => BookmarksActions.updateBookmarkSuccess({ changes: bookmark })),
              catchError((error) =>
                of(
                  BookmarksActions.updateBookmarkFailure({
                    error: error?.message || 'Bookmark update failed',
                  })
                )
              )
            );
          })
        )
      )
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
          map((bookmark) => BookmarksActions.deleteBookmarkSuccess({ id })),
          catchError(() => {
            // TODO: Log to Raygun
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
