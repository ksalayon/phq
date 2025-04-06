import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { BookmarkFormComponent } from '../../components/bookmark-form/bookmark-form.component';
import { CreateBookmarkPayload } from '../../models/bookmark';
import { Store } from '@ngrx/store';
import { BookmarksActions } from '../../state/bookmarks.actions';
import { BookmarksTableComponent } from '../../components/bookmarks-table/bookmarks-table.component';
import {
  selectAllBookmarks,
  selectError,
  selectIsSubmitting,
} from '../../state/bookmarks.selectors';
import { BehaviorSubject, Subject, withLatestFrom } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VMBookmark } from '../../components/bookmarks-table/bookmarks-table.models';
import { ModalService } from '../../../../shared/services/modal-dialog.service';
import { BookmarksUtils } from '../../utils/bookmark.util';
import { ConfirmDeleteDialogComponent } from '../../components/confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  standalone: true,
  selector: 'phq-bookmarks-page',
  imports: [BookmarkFormComponent, BookmarksTableComponent],
  templateUrl: './bookmarks-page.component.html',
  styleUrl: './bookmarks-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarksPageComponent implements OnInit {
  private store = inject(Store);

  constructor() {}

  isFormSubmittingSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isFormSubmitting$ = this.isFormSubmittingSubject$.asObservable();

  bookmarks$ = this.store.select(selectAllBookmarks);
  bookmarkErrorSubject$: Subject<string | null> | undefined = new Subject<string | null>();
  bookmarkError$ = this.bookmarkErrorSubject$?.asObservable();

  destroyRef = inject(DestroyRef);
  // modal service from shared directory
  modalService = inject(ModalService);

  ngOnInit() {
    this.monitorFormSubmissionProgress();
  }

  /**
   * Monitors the progress of form submission by observing the submission state and
   * capturing any associated errors. Updates internal subjects to reflect the current
   * state of form submission and errors.
   *
   * @return {void} This method does not return a value.
   */
  private monitorFormSubmissionProgress(): void {
    this.store
      .select(selectIsSubmitting)
      .pipe(takeUntilDestroyed(this.destroyRef), withLatestFrom(this.store.select(selectError)))
      .subscribe(([isSubmitting, error]) => {
        this.isFormSubmittingSubject$.next(isSubmitting);
        if (!isSubmitting) {
          this?.bookmarkErrorSubject$?.next(error);
        }
      });
  }

  /**
   * Handles the submission of the form to create a new bookmark.
   *
   * @param {CreateBookmarkPayload} $event - The payload containing the data necessary to create a bookmark.
   * @return {void} No return value.
   */
  onFormSubmit($event: CreateBookmarkPayload): void {
    this.store.dispatch(BookmarksActions.createBookmark({ payload: $event }));
  }

  // Handle bookmark deletion
  onDeleteBookmark(bookmark: VMBookmark) {
    console.log('onDeleteBookmark', bookmark);
    this.modalService.open(ConfirmDeleteDialogComponent, {
      inputs: {
        bookmark: BookmarksUtils.transformSingleVMToBookmark(bookmark),
      },
      outputs: {
        submitted: (data) => {
          // dispatch event to update bookmark
          // this.store.dispatch(BookmarksActions.updateBookmark({ payload: data }));
          console.log('confirm delete submitted', data);
          this.modalService.close();
        },
        closed: () => {
          console.log('cancel delete');
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
        error$: this.bookmarkError$,
        orientation: 'vertical',
      },
      outputs: {
        submitted: (data) => {
          // dispatch event to update bookmark
          this.store.dispatch(BookmarksActions.updateBookmark({ payload: data }));
          this.modalService.close();
        },
        closed: () => {
          this.modalService.close();
        },
      },
    });
  }
}
