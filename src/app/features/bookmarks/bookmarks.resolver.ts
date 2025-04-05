import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, take } from 'rxjs/operators';

/**
 * Resolver for the bookmarks feature route to make sure that the bookmarks store is ready when navigating to it
 */
@Injectable({
  providedIn: 'root',
})
export class BookmarksResolver implements Resolve<void> {
  constructor(private store: Store) {}

  resolve(): void {
    // Wait for the store to initialize the "bookmarks" state

    this.store
      // @ts-ignore
      .select((state) => state.bookmarks) // Adjust the selector if needed
      .pipe(
        filter((bookmarksState) => !!bookmarksState), // Wait for state to exist
        take(1) // Complete after state initialization
      )
      .subscribe();
  }
}
