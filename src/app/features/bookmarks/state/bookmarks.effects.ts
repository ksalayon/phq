import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { BookmarksActions } from './bookmarks.actions';
import { BookmarkService } from '../services/bookmark.service';
import { of } from 'rxjs';

@Injectable()
export class BookmarksEffects {
  private actions$ = inject(Actions);
  private bookmarkService = inject(BookmarkService);

  createBookmark$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.createBookmark),
      mergeMap((action) => {
        return this.bookmarkService.createBookmark(action.payload).pipe(
          map((bookmark) => {
            return BookmarksActions.createBookmarkSuccess({ bookmark });
          }),
          catchError((error) => {
            return of(
              BookmarksActions.createBookmarkFailure(error?.message || 'Bookmark creation failed')
            );
          })
        );
      })
    )
  );
}
