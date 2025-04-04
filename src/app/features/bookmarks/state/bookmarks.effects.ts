import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as BookmarksActions from './bookmarks.actions';
import { BookmarkService } from '../services/bookmark.service';

@Injectable()
export class BookmarksEffects {
  loadBookmarks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.loadBookmarks),
      mergeMap(() =>
        this.bookmarkService.getBookmarks().pipe(
          map((bookmarks) => BookmarksActions.loadBookmarksSuccess({ bookmarks })),
          catchError((error) => of(BookmarksActions.loadBookmarksFailure({ error })))
        )
      )
    )
  );

  createBookmark$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.createBookmark),
      mergeMap((action) =>
        this.bookmarkService.createBookmark(action.bookmark).pipe(
          map((bookmark) => BookmarksActions.createBookmarkSuccess({ bookmark })),
          catchError((error) => of(BookmarksActions.createBookmarkFailure({ error })))
        )
      )
    )
  );

  updateBookmark$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.updateBookmark),
      mergeMap((action) =>
        this.bookmarkService.updateBookmark(action.changes).pipe(
          map(() =>
            BookmarksActions.updateBookmarkSuccess({ id: action.id, changes: action.changes })
          ),
          catchError((error) => of(BookmarksActions.updateBookmarkFailure({ error })))
        )
      )
    )
  );

  deleteBookmark$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.deleteBookmark),
      mergeMap((action) =>
        this.bookmarkService.deleteBookmark(action.id).pipe(
          map(() => BookmarksActions.deleteBookmarkSuccess({ id: action.id })),
          catchError((error) => of(BookmarksActions.deleteBookmarkFailure({ error })))
        )
      )
    )
  );

  // Similar effects for create, update, and delete can be added here

  constructor(
    private actions$: Actions,
    private bookmarkService: BookmarkService
  ) {}
}
