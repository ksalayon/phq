import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { BookmarkFormComponent } from '../../components/bookmark-form/bookmark-form.component';
import { CreateBookmarkPayload } from '../../models/bookmark';
import { Store } from '@ngrx/store';
import { BookmarksActions } from '../../state/bookmarks.actions';
import { BookmarksTableComponent } from '../../components/bookmarks-table/bookmarks-table.component';
import { selectAllBookmarks } from '../../state/bookmarks.selectors';
import { BehaviorSubject, Subject } from 'rxjs';
import { VMBookmark } from '../../components/bookmarks-table/bookmarks-table.models';
import { ModalService } from '../../../../shared/services/modal-dialog.service';
import { BookmarksUtils } from '../../utils/bookmark.util';
import { ConfirmDeleteDialogComponent } from '../../components/confirm-delete-dialog/confirm-delete-dialog.component';
import { BookmarkStateService } from '../../services/bookmark-state.service';

@Component({
  standalone: true,
  selector: 'phq-bookmarks-page',
  imports: [BookmarkFormComponent, BookmarksTableComponent],
  templateUrl: './bookmarks-page.component.html',
  styleUrl: './bookmarks-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [BookmarkStateService],
})
export class BookmarksPageComponent implements OnInit {
  private store = inject(Store);

  constructor() {}

  isFormSubmittingSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isFormSubmitting$ = this.isFormSubmittingSubject$.asObservable();

  bookmarks$ = this.store.select(selectAllBookmarks);
  bookmarkCreateErrorSubject$: Subject<string | null> | undefined = new Subject<string | null>();
  bookmarkCreateError$ = this.bookmarkCreateErrorSubject$?.asObservable();

  bookmarkUpdateErrorSubject$: Subject<string | null> | undefined = new Subject<string | null>();
  bookmarkUpdateError$ = this.bookmarkUpdateErrorSubject$?.asObservable();

  destroyRef = inject(DestroyRef);
  // modal service from shared directory
  modalService = inject(ModalService);
  bookmarkStateService = inject(BookmarkStateService);

  ngOnInit() {}

  /**
   * Handles the submission of the form to create a new bookmark.
   *
   * @param {CreateBookmarkPayload} $event - The payload containing the data necessary to create a bookmark.
   * @return {void} No return value.
   */
  onCreateBookmark($event: CreateBookmarkPayload): void {
    this.isFormSubmittingSubject$.next(true);
    this.store.dispatch(BookmarksActions.createBookmark({ payload: $event }));
    this.bookmarkStateService.monitorSubmission().subscribe(({ success, error }) => {
      this.isFormSubmittingSubject$.next(false);
      if (error) {
        this?.bookmarkCreateErrorSubject$?.next(error);
      }
    });
  }

  // Handle bookmark deletion
  onDeleteBookmark(bookmark: VMBookmark) {
    this.modalService.open(ConfirmDeleteDialogComponent, {
      inputs: {
        bookmark: BookmarksUtils.transformSingleVMToBookmark(bookmark),
      },
      outputs: {
        submitted: (data) => {
          // dispatch event to delete bookmark
          this.store.dispatch(BookmarksActions.deleteBookmark({ id: data.id }));
          // Listen for success or failure
          this.bookmarkStateService.monitorSubmission().subscribe(({ success, error }) => {
            if (success) {
              this.modalService.close(); // Close the modal on success
            } else {
              // TODO: Show snackbar error
            }
          });
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
          // dispatch event to update bookmark
          this.store.dispatch(BookmarksActions.updateBookmark({ payload: data }));

          // Listen for success or failure
          this.bookmarkStateService.monitorSubmission().subscribe(({ success, error }) => {
            if (success) {
              this.modalService.close(); // Close the modal on success
            } else {
              this.bookmarkUpdateErrorSubject$?.next(error);
            }
          });
        },
        closed: () => {
          this.modalService.close();
        },
      },
    });
  }
}
