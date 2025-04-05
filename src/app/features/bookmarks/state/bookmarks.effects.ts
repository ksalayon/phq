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
}
