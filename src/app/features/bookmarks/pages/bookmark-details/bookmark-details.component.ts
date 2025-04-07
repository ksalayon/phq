import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { selectBookmarkById } from '../../state/bookmarks.selectors'; // Selector to fetch bookmarks
import { Bookmark } from '../../models/bookmark';
import { AsyncPipe, CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatButton } from '@angular/material/button';

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
  imports: [AsyncPipe, CommonModule, MatCardModule, MatButton],
})
export class BookmarkDetailsComponent implements OnInit {
  destroyRef = inject(DestroyRef);

  // Observable for the selected bookmark
  bookmark$: Observable<Bookmark | undefined> | undefined;

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
    // extract "new" from queryParams$ to determine whether to display a "thank you" message in the html
    this.queryParams$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((queryParams) => {
      if (queryParams.new) {
        this.isForNewBookmark$.next(true);
      }
    });
    // Extract the "id" from the route and fetch the bookmark from the store
    this.bookmark$ = this.route.paramMap.pipe(
      takeUntilDestroyed(this.destroyRef),
      map((paramMap) => paramMap.get('id')), // Extract the "id" parameter
      switchMap((id) => {
        if (!id) return [undefined]; // Handle invalid "id" gracefully
        return this.store.select(selectBookmarkById(id)); // Use selector to fetch the bookmark
      })
    );
  }

  backButtonHandler() {
    // Retrieve the current page state from the store
    this.store
      .select('bookmarks')
      .pipe(
        map((state) => state.currentPage), // Assuming currentPage contains pageIndex and pageSize
        take(1)
      )
      .subscribe((currentPage) => {
        const { pageIndex = 0, pageSize = 20 } = currentPage || {}; // Default values if undefined
        // Navigate back to the bookmarks page with queryParams
        this.router.navigate(['/bookmarks'], {
          queryParams: { pageIndex, pageSize },
        });
      });
  }
}
