import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, withLatestFrom } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { selectBookmarkById, selectError } from '../../state/bookmarks.selectors'; // Selector to fetch bookmarks
import { Bookmark } from '../../models/bookmark';
import { AsyncPipe, CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { BookmarksActions } from '../../state/bookmarks.actions';
import { DEFAULT_PAGE_SIZE, FIRST_PAGE_INDEX } from '../../models/bookmarks-table.models';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

/**
 * BookmarkDetailsComponent is a standalone Angular component used to display the details of a specific bookmark.
 * It interacts with the route parameters and query parameters to determine the bookmark details to display and
 * whether it corresponds to a newly created bookmark.
 */
@Component({
  standalone: true,
  selector: 'phq-bookmark-details',
  templateUrl: './bookmark-details.component.html',
  styleUrls: ['./bookmark-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, CommonModule, MatCardModule, MatButton, MatProgressSpinner],
})
export class BookmarkDetailsComponent implements OnInit {
  destroyRef = inject(DestroyRef);

  // Observable for the selected bookmark
  bookmark$: Observable<Bookmark | undefined> | undefined;

  error$: Observable<string | null> | undefined;

  // async property that the template uses to determine whether this page is being viewed
  // for a newly created bookmark via /bookmarks/details/:id?new=true
  isForNewBookmark$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private route = inject(ActivatedRoute); // Access the current route
  private router = inject(Router);

  private queryParams$: Observable<any> = this.route.queryParamMap.pipe(
    map((queryParamMap) => ({
      // Map query params to an object
      new: queryParamMap.get('new'), //query param, "new", signifies that component is used for a newly created bookmark
    }))
  );

  private store = inject(Store); // Access the global NGRX store

  ngOnInit() {
    this.watchQueryParams();
    this.watchRouteParams();
  }

  /**
   * Handles the action performed when the back button is pressed.
   * Depending on the current state and flags, navigates back to the bookmarks page,
   * either resetting to the first page or preserving the current pagination parameters.
   *
   * @return {void} Does not return a value.
   */
  backButtonHandler(): void {
    // Retrieve the current page state from the store
    this.store
      .select('bookmarks')
      .pipe(
        map((state) => state.currentPage), // Assuming currentPage contains pageIndex and pageSize
        take(1),
        withLatestFrom(this.isForNewBookmark$)
      )
      .subscribe(([currentPage, isForNewBookmark]) => {
        const { pageIndex = FIRST_PAGE_INDEX, pageSize = DEFAULT_PAGE_SIZE } = currentPage || {}; // Default values if undefined
        // When this view is loaded on account of creating a new bookmark,
        // then always redirect user to the first page
        if (isForNewBookmark) {
          this.router
            .navigate(['/bookmarks'], {
              queryParams: { pageIndex: 0, pageSize },
            })
            .then();
          return;
        }
        // Navigate back to the bookmarks page with queryParams - goes back to the
        // same page where the user initially came from to view this bookmark
        this.router
          .navigate(['/bookmarks'], {
            queryParams: { pageIndex, pageSize },
          })
          .then();
      });
  }

  // extract "new" from queryParams$ to determine whether to display a "thank you" message in the html
  private watchQueryParams(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((queryParams) => {
      const isNew = queryParams.get('new');
      this.isForNewBookmark$.next(!!isNew);
    });
  }

  /**
   * This method listens to route parameter changes and, based on the retrieved 'id', dispatches
   * an action to load the corresponding bookmark. It then selects the bookmark data and
   * error state from the store for further use.
   *
   * @return {void} No value is returned since this method sets up subscriptions for route
   * parameters and state management updates.
   */
  private watchRouteParams(): void {
    this.bookmark$ = this.route.paramMap.pipe(
      map((paramMap) => paramMap.get('id')),
      switchMap((id) => {
        if (!id) return [undefined];
        this.store.dispatch(BookmarksActions.loadBookmark({ id })); // Dispatch NGRX action to load the bookmark
        return this.store.select(selectBookmarkById(id)); // Select the bookmark from what was added to the store
      })
    );

    this.error$ = this.store.select(selectError); // Select the error state from the store
  }
}
