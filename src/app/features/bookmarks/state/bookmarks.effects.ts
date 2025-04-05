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
            const bookmarkExists = bookmarks.some(
              (bookmark) => bookmark.name === action.payload.name
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
}
