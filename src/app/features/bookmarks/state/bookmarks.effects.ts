import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { BookmarksActions } from './bookmarks.actions';
import { BookmarkService } from '../services/bookmark.service';

@Injectable()
export class BookmarksEffects {
  // loadBookmarks$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(BookmarksActions.loadBookmarks),
  //     mergeMap(() =>
  //       this.bookmarkService.getBookmarks().pipe(
  //         map((bookmarks) => BookmarksActions.loadBookmarksSuccess({ bookmarks })),
  //         catchError((error) => of(BookmarksActions.loadBookmarksFailure({ error })))
  //       )
  //     )
  //   )
  // );

  createBookmark$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookmarksActions.createBookmark),
      mergeMap((action) =>
        this.bookmarkService.createBookmark(action.payload).pipe(
          map((bookmark) => {
            console.log('createBookmark$', bookmark);
            return BookmarksActions.createBookmarkSuccess({ bookmark });
          }),
          catchError((error) => of(BookmarksActions.createBookmarkFailure({ error })))
        )
      )
    )
  );

  // updateBookmark$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(BookmarksActions.updateBookmark),
  //     mergeMap((action) =>
  //       this.bookmarkService.updateBookmark(action.changes).pipe(
  //         map(() => BookmarksActions.updateBookmarkSuccess({ changes: action.changes })),
  //         catchError((error) => of(BookmarksActions.updateBookmarkFailure({ error })))
  //       )
  //     )
  //   )
  // );
  //
  // deleteBookmark$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(BookmarksActions.deleteBookmark),
  //     mergeMap((action) =>
  //       this.bookmarkService.deleteBookmark(action.id).pipe(
  //         map(() => BookmarksActions.deleteBookmarkSuccess({ id: action.id })),
  //         catchError((error) => of(BookmarksActions.deleteBookmarkFailure({ error })))
  //       )
  //     )
  //   )
  // );

  // private actions$ = inject(Actions);
  // private bookmarkService = inject(BookmarkService);
  constructor(
    private actions$: Actions,
    private bookmarkService: BookmarkService
  ) {
    console.log('Effects initialized. Has actions$:', !!this.actions$);
  }
}
