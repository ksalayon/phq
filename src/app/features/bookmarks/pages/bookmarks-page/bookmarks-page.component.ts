import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BookmarkFormComponent } from '../../components/bookmark-form/bookmark-form.component';
import { Bookmark, CreateBookmarkPayload, CurrentPageState } from '../../models/bookmark';
import { Store } from '@ngrx/store';
import { BookmarksActions } from '../../state/bookmarks.actions';
import { BookmarksTableComponent } from '../../components/bookmarks-table/bookmarks-table.component';
import {
  selectBookmarksTotalCount,
  selectCurrentPageBookmarks,
  selectCurrentPageState,
  selectLoading,
} from '../../state/bookmarks.selectors';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  Observable,
  of,
  Subject,
  tap,
  withLatestFrom,
} from 'rxjs';
import {
  DEFAULT_PAGE_SIZE,
  FIRST_PAGE_INDEX,
  VMBookmark,
} from '../../models/bookmarks-table.models';
import { ModalService } from '../../../../shared/services/modal-dialog.service';
import { BookmarksUtils } from '../../utils/bookmark.util';
import { ConfirmDeleteDialogComponent } from '../../components/confirm-delete-dialog/confirm-delete-dialog.component';
import { BookmarkStateService } from '../../services/bookmark-state.service';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SnackbarService } from '../../../../shared/services/snackbar.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { filter, map, switchMap } from 'rxjs/operators';
import { MatButton } from '@angular/material/button';
import { BookmarkService } from '../../services/bookmark.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

/**
 * BookmarksPageComponent is a container component that provides functionality for managing bookmarks.
 * It integrates features such as creating, editing, deleting, and viewing bookmarks.
 * The component employs reactive state management, modal dialogs, and routing.
 *
 * This component depends on BookmarkFormComponent and BookmarksTableComponent for
 * UI presentation and interaction with user inputs. State management and side effects
 * are handled by injected services.
 *
 * Functionalities and Features:
 * - Fetches and displays a list of bookmarks via reactive state management.
 * - Provides a form for creating new bookmarks with error handling and submission monitoring.
 * - Allows editing of existing bookmarks through a pre-filled modal form.
 * - Deletes bookmarks with a confirmation dialog.
 * - Redirects to detailed views for specific bookmarks upon selection.
 */
@Component({
  standalone: true,
  selector: 'phq-bookmarks-page',
  imports: [
    CommonModule,
    BookmarkFormComponent,
    BookmarksTableComponent,
    AsyncPipe,
    MatProgressSpinner,
    MatTooltip,
    MatButton,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './bookmarks-page.component.html',
  styleUrl: './bookmarks-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SnackbarService],
})
export class BookmarksPageComponent implements OnInit {
  // Access the child phq-bookmark-form component
  @ViewChild(BookmarkFormComponent) bookmarkFormComponent!: BookmarkFormComponent;

  isFormSubmittingSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isFormSubmitting$ = this.isFormSubmittingSubject$.asObservable();

  pageIndex = FIRST_PAGE_INDEX; // Starting at the first page
  pageSize = DEFAULT_PAGE_SIZE; // Default page size (matches MatPaginator)

  bookmarkUpdateErrorSubject$: Subject<string | null> | undefined = new Subject<string | null>();
  bookmarkUpdateError$ = this.bookmarkUpdateErrorSubject$?.asObservable();
  bookmarkCreateErrorSubject$: Subject<string | null> | undefined = new Subject<string | null>();
  bookmarkCreateError$ = this.bookmarkCreateErrorSubject$?.asObservable();

  searchTerm$ = new BehaviorSubject<string>(''); // Manages the search input

  bookmarksSubject$ = new BehaviorSubject<Bookmark[]>([]);
  bookmarks$ = this.bookmarksSubject$.asObservable();

  destroyRef = inject(DestroyRef);
  // modal service from shared directory
  modalService = inject(ModalService);
  bookmarkStateService = inject(BookmarkStateService);

  bookmarksTotalCountSUbject$ = new BehaviorSubject<number>(0);
  bookmarksTotalCount$ = this.bookmarksTotalCountSUbject$.asObservable();

  private store = inject(Store);

  private router = inject(Router);
  private snackbarService = inject(SnackbarService);
  private route = inject(ActivatedRoute);
  private bookmarkService = inject(BookmarkService);

  private searchPageState$ = new BehaviorSubject<CurrentPageState & { totalCount: number }>({
    pageIndex: 0,
    pageSize: 20,
    totalCount: 0,
  });

  get loading$(): Observable<boolean> {
    return this.store.select(selectLoading);
  }

  /**
   * A getter method that provides an observable which emits the current page state
   * from the application's data store. This allows reactive subscription to
   * state changes related to the current page - i.e. current pageSize and pageIndex
   *
   * @return {Observable<CurrentPageState>} An observable of the current page state.
   */
  get currentPageState$(): Observable<CurrentPageState> {
    return this.store.select(selectCurrentPageState);
  }

  ngOnInit() {
    this.store
      .select(selectCurrentPageBookmarks(this.pageIndex, this.pageSize))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((bookmarks) => {
        this.bookmarksSubject$.next(bookmarks);
      });

    this.searchTerm$
      .pipe(
        filter((query) => !!query),
        debounceTime(700),
        distinctUntilChanged(),
        withLatestFrom(this.searchPageState$),
        switchMap(([query, searchPageState]) => {
          this.pageIndex = searchPageState.pageIndex;
          this.pageSize = searchPageState.pageSize;
          return this.bookmarkService
            .searchBookmarksByUrl(query, searchPageState.pageIndex, searchPageState.pageSize)
            .pipe(map((results) => ({ results, searchPageState, query })));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ results }) => {
        this.bookmarksSubject$.next(results);
      });

    let currentSearchTerm = '';
    this.bookmarksSubject$
      .pipe(
        withLatestFrom(this.searchTerm$),
        switchMap(([results, searchTerm]) => {
          if (results.length && searchTerm !== currentSearchTerm) {
            currentSearchTerm = searchTerm;
            return this.bookmarkService.getBookmarkSearchResultCount(searchTerm).pipe(
              tap((count) => {
                this.bookmarksTotalCountSUbject$.next(count);
              })
            );
          }
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((bookmarks) => {});

    this.store
      .select(selectBookmarksTotalCount)
      .pipe(
        map((count) => count ?? 0),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((count) => {
        this.bookmarksTotalCountSUbject$.next(count);
      });

    // Listens to pagination changes and loads bookmarks with those changes
    this.currentPageState$
      .pipe(
        withLatestFrom(this.searchTerm$),
        switchMap(([pageState, search]) => {
          if (search) {
            console.log('changing pagination whiel on search mode');
            return this.bookmarkService
              .searchBookmarksByUrl(search, this.pageIndex, this.pageSize)
              .pipe(
                map((searchresults) => {
                  console.log('searchresults after pagination', searchresults);
                  this.bookmarksSubject$.next(searchresults);
                  return { pageState, search };
                })
              );
          }
          return of({ pageState, search });
        }),
        filter(({ search }) => !search),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ pageState }) => {
        this.pageIndex = pageState?.pageIndex || 0;
        this.pageSize = pageState?.pageSize || DEFAULT_PAGE_SIZE;
        this.loadBookmarks(); // Load the page based on saved state
      });

    // Listens to queryParams changes (pageIndex and pageSize in particular)
    // and dispatches those values to the store and may trigger loading of bookmarks for that page
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const pageIndex = params['pageIndex'] ? parseInt(params['pageIndex'], 10) : 0;
      const pageSize = params['pageSize'] ? parseInt(params['pageSize'], 10) : DEFAULT_PAGE_SIZE;
      this.pageIndex = pageIndex;
      this.pageSize = pageSize;
      this.store.dispatch(
        BookmarksActions.saveCurrentPageState({
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
        })
      );
    });
  }

  onSearchInput(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    if (input && input.length > 2) {
      this.searchTerm$.next(input); // Update the search term
    }
  }

  // Method to load bookmarks for the current page
  loadBookmarks() {
    this.store.dispatch(
      BookmarksActions.loadBookmarks({
        startIndex: this.pageIndex * this.pageSize,
        limit: this.pageSize,
      })
    );
  }

  /**
   * Handles the paginator change event to update the query parameters in the
   * browser and dispatch the current page state to the store.
   *
   * @param {Object} event - The event object containing pagination details.
   * @param {number} event.pageIndex - The current page index after the paginator change.
   * @param {number} event.pageSize - The number of items per page after the paginator change.
   * @return {void} This method does not return any value.
   */
  onPaginatorChange(event: { pageIndex: number; pageSize: number }): void {
    // Reflect query params on browser once the user starts paginating through the table
    this.router
      .navigate([], {
        queryParams: { pageIndex: event.pageIndex, pageSize: event.pageSize },
        queryParamsHandling: 'merge',
      })
      .then();

    this.store.dispatch(
      BookmarksActions.saveCurrentPageState({
        pageIndex: event.pageIndex,
        pageSize: event.pageSize,
      })
    );
  }

  /**
   * Handles the submission of the form to create a new bookmark.
   *
   * @param {CreateBookmarkPayload} $event - The payload containing the data necessary to create a bookmark.
   * @return {void} No return value.
   */
  onCreateBookmark($event: CreateBookmarkPayload): void {
    this.isFormSubmittingSubject$.next(true);
    this.bookmarkStateService
      .monitorSubmission()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ success, error, id }) => {
        this.isFormSubmittingSubject$.next(false);
        if (error) {
          this?.bookmarkCreateErrorSubject$?.next(error);
        }
        if (success && id) {
          // Redirect to the details page with the created ID
          this.router
            .navigate([`/bookmarks/details/${id}`], {
              // "new" query parameter lets the /bookmarks/details/:id route know that we are using the view for a newly created bookmark
              queryParams: { new: true },
            })
            .then();
        }
      });
    this.store.dispatch(BookmarksActions.createBookmark({ payload: $event }));
    this.pageIndex = 0; // Reset to the first page to ensure new data is shown
  }

  /**
   * Handles the deletion of a bookmark by opening a confirmation dialog,
   * monitoring the submission process, and dispatching the delete action
   * to update the application state.
   *
   * @param {VMBookmark} bookmark - The bookmark object to be deleted. It represents the virtual model of a bookmark entity.
   * @return {void} This method does not return any value.
   */
  onDeleteBookmark(bookmark: VMBookmark): void {
    this.modalService.open(ConfirmDeleteDialogComponent, {
      inputs: {
        bookmark: BookmarksUtils.transformSingleVMToBookmark(bookmark),
      },
      outputs: {
        submitted: (data) => {
          // Listen for success or failure
          this.bookmarkStateService
            .monitorSubmission()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(({ success, error }) => {
              if (success) {
                this.modalService.close(); // Close the modal on success
                this.snackbarService.success(`Bookmark successfully deleted`);
              } else {
                // TODO: Show snackbar error
              }
            });
          // dispatch event to delete bookmark
          this.store.dispatch(BookmarksActions.deleteBookmark({ id: data.id }));
        },
        closed: () => {
          // Deletion cancelled
          this.modalService.close();
        },
      },
    });
  }

  /**
   * Opens a modal to edit an existing bookmark. The modal pre-fills the provided bookmark's details,
   * and dispatches an event to update the bookmark upon submission.
   *
   * @param {VMBookmark} bookmark - The bookmark object that needs to be edited, passed to the modal form.
   * @return {void} No value is returned.
   */
  onEditBookmark(bookmark: VMBookmark): void {
    this.modalService.open(BookmarkFormComponent, {
      inputs: {
        bookmark: BookmarksUtils.transformSingleVMToBookmark(bookmark),
        isLoading$: this.isFormSubmitting$,
        error$: this.bookmarkUpdateError$,
        orientation: 'vertical',
      },
      outputs: {
        submitted: (data) => {
          // Listen for success or failure
          this.bookmarkStateService
            .monitorSubmission()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(({ success, error }) => {
              if (success) {
                this.modalService.close(); // Close the modal on success
                this.snackbarService.success(`Bookmark successfully updated`);
              } else if (error) {
                this.bookmarkUpdateErrorSubject$?.next(error || 'Bookmark update failed');
              }
            });
          // dispatch event to update bookmark
          this.store.dispatch(BookmarksActions.updateBookmark({ payload: data }));
        },
        closed: () => {
          this.modalService.close();
        },
      },
    });
  }

  /**
   * Redirects the user to the detailed view of a bookmark at /bookmarks/details/:id
   */
  onViewBookmark(bookmark: VMBookmark): void {
    this.router.navigate(['/bookmarks/details', bookmark.id], {
      queryParams: { pageIndex: this.pageIndex, pageSize: this.pageSize },
    });
  }

  /**
   * Method to focus the URL input from BookmarkFormComponent.
   */
  focusOnForm(): void {
    this.bookmarkFormComponent?.focusUrl();
  }
}
