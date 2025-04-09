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
import { BookmarksTableComponent } from '../../components/bookmarks-table/bookmarks-table.component';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  Observable,
  Subject,
  tap,
  withLatestFrom,
} from 'rxjs';
import {
  DEFAULT_PAGE_SIZE,
  FIRST_PAGE_INDEX,
  MIN_SEARCH_LENGTH,
  SEARCH_DEBOUNCE_TIME,
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
import { filter, map } from 'rxjs/operators';
import { MatButton } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { SearchFormComponent } from '../../../../shared/components/search-form/search-form.component';
import { BookmarkPermissions } from '../../components/bookmarks-table/models/bookmarks-table.model';

/**
 * BookmarksPageComponent is a container component that provides functionality for managing bookmarks.
 * It integrates features such as creating, editing, deleting, and viewing bookmarks.
 * The component employs reactive state management, modal dialogs, and routing.
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
    FormsModule,
    SearchFormComponent,
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

  // Observable to determine if we are in search mode (searchTerm is not empty)
  isSearchMode$ = this.searchTerm$.pipe(
    map((term) => term.trim().length > 0) // True if search is active
  );

  // Permissions object for the table component
  bookmarkPermissions: BookmarkPermissions = {
    canEdit: true,
    canDelete: true,
    canVisit: true,
    canView: true, // Initial state: View is allowed
  };

  bookmarksSubject$ = new BehaviorSubject<Bookmark[]>([]);
  bookmarks$ = this.bookmarksSubject$.asObservable();

  destroyRef = inject(DestroyRef);
  // modal service from shared directory
  modalService = inject(ModalService);
  bookmarkStateService = inject(BookmarkStateService);

  bookmarksTotalCountSUbject$ = new BehaviorSubject<number>(0);
  bookmarksTotalCount$ = this.bookmarksTotalCountSUbject$.asObservable();

  private router = inject(Router);
  private snackbarService = inject(SnackbarService);
  private route = inject(ActivatedRoute);

  private searchPageState$ = new BehaviorSubject<CurrentPageState & { totalCount: number }>({
    pageIndex: 0,
    pageSize: 20,
    totalCount: 0,
  });

  private isSearchLoading$ = new BehaviorSubject<boolean>(false);

  get loading$(): Observable<boolean> {
    return combineLatest([this.isSearchLoading$, this.bookmarkStateService.selectLoading$()]).pipe(
      map(([isSearchLoading, isStoreLoading]) => isSearchLoading || isStoreLoading)
    );
  }

  /**
   * A getter method that provides an observable which emits the current page state
   * from the application's data store. This allows reactive subscription to
   * state changes related to the current page - i.e. current pageSize and pageIndex
   *
   * @return {Observable<CurrentPageState>} An observable of the current page state.
   */
  get currentPageState$(): Observable<CurrentPageState> {
    return this.bookmarkStateService.selectCurrentPageState$();
  }

  ngOnInit() {
    this.adjustPermissionsForSearchMode();
    this.monitorPaginatedBookmarks();
    this.monitorBookmarkSearch();
    this.monitorSearchResultCount();
    this.monitorBookmarksTotalCount();
    this.monitorPaginationChanges();
    this.monitorQueryParams();
  }

  /**
   * Monitors and updates the `bookmarkPermissions` object based on the application's search mode status.
   *
   * Subscribes to the `isSearchMode$` observable to determine if the application is in search mode
   * and adjusts the `canView` permission accordingly. When in search mode, `canView` is disabled.
   *
   * @return {void} This method does not return any value.
   */
  adjustPermissionsForSearchMode(): void {
    this.isSearchMode$.subscribe((isSearchMode) => {
      this.bookmarkPermissions = {
        ...this.bookmarkPermissions,
        canView: !isSearchMode, // Disable canView if in search mode
      };
    });
  }

  /**
   * Monitors and subscribes to the paginated bookmarks based on the current page index and page size.
   * Fetches the bookmarks using the store selector and updates the respective observables.
   *
   * @return {void} No return value.
   */
  monitorPaginatedBookmarks(): void {
    this.bookmarkStateService
      .selectCurrentPageBookmarks$(this.pageIndex, this.pageSize)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((bookmarks) => {
        this.isSearchLoading$.next(false);
        this.bookmarksSubject$.next(bookmarks);
      });
  }

  /**
   * Monitors the bookmark search functionality by listening to search term inputs,
   * applying filters, debouncing, and managing pagination. It dispatches an action
   * to execute a search operation with the current query and pagination parameters,
   * and updates the search loading state in the process.
   *
   * @return {void} Executes the necessary operations to handle bookmark search,
   * including dispatching actions and updating internal states.
   */
  monitorBookmarkSearch(): void {
    this.searchTerm$
      .pipe(
        filter((query) => !!query), // Only trigger this if the search string is not empty
        debounceTime(SEARCH_DEBOUNCE_TIME),
        // distinctUntilChanged(), // Make sure that it only triggers the rest of the pipe if the input is distinct
        withLatestFrom(this.searchPageState$),
        tap(([query, searchPageState]) => {
          this.pageIndex = searchPageState.pageIndex;
          this.pageSize = searchPageState.pageSize;
          const dispatchParam = {
            urlQuery: query,
            startIndex: searchPageState.pageIndex * searchPageState.pageSize,
            limit: searchPageState.pageSize,
          };
          // Dispatch the searchBookmarksByUrl action with the query and pagination state
          this.bookmarkStateService.searchBookmarksByUrl$(dispatchParam);

          // Set the loading state
          this.isSearchLoading$.next(true);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  /**
   * Monitors the search result count for bookmark results based on the current search term.
   * Compares the current search term with the previous one and dispatches an action to fetch
   * the search result count if they differ and there are results present.
   *
   * @return {void} Does not return a value.
   */
  monitorSearchResultCount(): void {
    let currentSearchTerm = '';
    this.bookmarksSubject$
      .pipe(
        withLatestFrom(this.searchTerm$),
        tap(([results, searchTerm]) => {
          if (results.length && searchTerm !== currentSearchTerm) {
            currentSearchTerm = searchTerm;
            // Dispatch the action to get the search result count
            this.bookmarkStateService.getBookmarkSearchResultCount(searchTerm);
          }
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  /**
   * Monitors the total count of bookmarks and updates the internal subject with the count.
   *
   * @return {void} This method does not return any value.
   */
  monitorBookmarksTotalCount(): void {
    this.bookmarkStateService
      .selectBookmarksTotalCount$()
      .pipe(
        map((count) => count ?? 0),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((count) => {
        this.bookmarksTotalCountSUbject$.next(count);
      });
  }

  /**
   * Monitors changes to query parameters (specifically `pageIndex` and `pageSize`), updates the local state,
   * and dispatches the updated values to the store. This may also trigger loading of bookmarks for the current page.
   *
   * @return {void} This method does not return a value.
   */
  monitorQueryParams(): void {
    // Listens to queryParams changes (pageIndex and pageSize in particular)
    // and dispatches those values to the store and may trigger loading of bookmarks for that page
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const pageIndex = params['pageIndex'] ? parseInt(params['pageIndex'], 10) : 0;
      const pageSize = params['pageSize'] ? parseInt(params['pageSize'], 10) : DEFAULT_PAGE_SIZE;
      this.pageIndex = pageIndex;
      this.pageSize = pageSize;
      this.bookmarkStateService.saveCurrentPageState(this.pageIndex, this.pageSize);
    });
  }

  /**
   * Monitors changes in pagination state and manages the logic for loading bookmarks or performing search operations based on the current page state and search term.
   *
   * @return {void} This method does not return a value. It performs side effects such as dispatching actions and triggering data loading.
   */
  monitorPaginationChanges(): void {
    this.currentPageState$
      .pipe(
        withLatestFrom(this.searchTerm$),
        tap(([pageState, search]) => {
          const pageIndex = pageState.pageIndex || FIRST_PAGE_INDEX;
          const pageSize = pageState.pageSize || DEFAULT_PAGE_SIZE;
          if (search) {
            this.isSearchLoading$.next(true);
            const dispatchParam = {
              urlQuery: search,
              startIndex: pageIndex * pageSize,
              limit: pageSize,
            };
            // Dispatch the action to search bookmarks with pagination
            this.bookmarkStateService.searchBookmarksByUrl$(dispatchParam);
          }
          this.pageIndex = pageIndex;
          this.pageSize = pageSize;
        }),
        filter(([_, search]) => !search), // Only proceed if no search term is provided
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.loadBookmarks(); // Load bookmarks based on the current state
      });
  }

  /**
   * Handles the user input from a search field. Updates the search term stream
   * if the input length is greater than 2 characters.
   *
   * @return {void} This method does not return a value.
   * @param searchTerm
   */
  onSearchSubmit(searchTerm: string): void {
    if (!searchTerm || searchTerm.trim().length < MIN_SEARCH_LENGTH) {
      return;
    }
    this.pageIndex = 0;
    this.bookmarkStateService.saveCurrentPageState(0, this.pageSize);
    this.searchTerm$.next(searchTerm);
  }

  /**
   * Clears the current search term and resets the paginator settings to default values.
   * This brings the user back to the default first page of bookmarks.
   * @return {void} Does not return a value.
   */
  clearSearch(): void {
    this.pageIndex = 0; // Reset the page index to the first page
    this.searchTerm$.next(''); // Clear the search term
    this.bookmarkStateService.loadBookmarks(this.pageIndex, this.pageSize); // Reload all bookmarks
    this.bookmarkStateService.saveCurrentPageState(this.pageIndex, this.pageSize); // Save state to redux/ngrx
  }

  /**
   * Loads bookmarks by dispatching an action to fetch a subset of bookmarks
   * based on the current page index and page size.
   *
   * @return {void} This method does not return a value.
   */
  loadBookmarks(): void {
    this.bookmarkStateService.loadBookmarks(this.pageIndex, this.pageSize);
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
    this.bookmarkStateService.saveCurrentPageState(event.pageIndex, event.pageSize);
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
            .navigate([`/details/${id}`], {
              // "new" query parameter lets the /bookmarks/details/:id route know that we are using the view for a newly created bookmark
              queryParams: { new: true },
            })
            .then();
        }
      });
    this.bookmarkStateService.createBookmark($event);
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
          this.bookmarkStateService.deleteBookmark(data.id);
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
          this.bookmarkStateService.updateBookmark(data);
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
    this.router.navigate(['/details', bookmark.id], {
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
