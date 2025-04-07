import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { BookmarkFormComponent } from '../../components/bookmark-form/bookmark-form.component';
import { Bookmark, CreateBookmarkPayload } from '../../models/bookmark';
import { Store } from '@ngrx/store';
import { BookmarksActions } from '../../state/bookmarks.actions';
import { BookmarksTableComponent } from '../../components/bookmarks-table/bookmarks-table.component';
import {
  selectBookmarksTotalCount,
  selectCurrentPageBookmarks,
  selectCurrentPageState,
} from '../../state/bookmarks.selectors';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { VMBookmark } from '../../components/bookmarks-table/bookmarks-table.models';
import { ModalService } from '../../../../shared/services/modal-dialog.service';
import { BookmarksUtils } from '../../utils/bookmark.util';
import { ConfirmDeleteDialogComponent } from '../../components/confirm-delete-dialog/confirm-delete-dialog.component';
import { BookmarkStateService } from '../../services/bookmark-state.service';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SnackbarService } from '../../../../shared/services/snackbar.service';
import { AsyncPipe } from '@angular/common';

const FIRST_PAGE_INDEX = 0;
const DEFAULT_PAGE_SIZE = 20;

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
  imports: [BookmarkFormComponent, BookmarksTableComponent, AsyncPipe],
  templateUrl: './bookmarks-page.component.html',
  styleUrl: './bookmarks-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SnackbarService],
})
export class BookmarksPageComponent implements OnInit {
  isFormSubmittingSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isFormSubmitting$ = this.isFormSubmittingSubject$.asObservable();

  pageIndex = FIRST_PAGE_INDEX; // Starting at the first page
  pageSize = DEFAULT_PAGE_SIZE; // Default page size (matches MatPaginator)

  bookmarkUpdateErrorSubject$: Subject<string | null> | undefined = new Subject<string | null>();
  bookmarkUpdateError$ = this.bookmarkUpdateErrorSubject$?.asObservable();
  bookmarkCreateErrorSubject$: Subject<string | null> | undefined = new Subject<string | null>();
  bookmarkCreateError$ = this.bookmarkCreateErrorSubject$?.asObservable();

  destroyRef = inject(DestroyRef);
  // modal service from shared directory
  modalService = inject(ModalService);
  bookmarkStateService = inject(BookmarkStateService);
  private store = inject(Store);

  private router = inject(Router);
  private snackbarService = inject(SnackbarService);
  private currentPageState$ = this.store.select(selectCurrentPageState);
  private route = inject(ActivatedRoute);

  /**
   * Retrieves an observable stream of all bookmarks from the store.
   *
   * @return {Observable<Array>} An observable emitting an array of all bookmarks.
   */
  get bookmarks$(): Observable<Bookmark[]> {
    return this.store.select(selectCurrentPageBookmarks(this.pageIndex, this.pageSize));
  }

  get bookmarksTotalCount$() {
    return this.store.select(selectBookmarksTotalCount);
  }

  ngOnInit() {
    this.currentPageState$.subscribe((pageState) => {
      this.pageIndex = pageState?.pageIndex || 0;
      this.pageSize = pageState?.pageSize || DEFAULT_PAGE_SIZE;
      this.loadBookmarks(); // Load the page based on saved state
    });
    this.route.queryParams.subscribe((params) => {
      const pageIndex = params['pageIndex'] ? parseInt(params['pageIndex'], 10) : 0;
      const pageSize = params['pageSize'] ? parseInt(params['pageSize'], 10) : DEFAULT_PAGE_SIZE;
      this.pageIndex = pageIndex;
      this.pageSize = pageSize;
      this.loadBookmarks();
    });
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

  // Handle paginator events
  onPaginatorChange(event: { pageIndex: number; pageSize: number }) {
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

  // Handle bookmark deletion
  onDeleteBookmark(bookmark: VMBookmark) {
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
}
