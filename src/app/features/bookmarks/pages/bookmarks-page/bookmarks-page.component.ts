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
    this.store
      .select(selectIsSubmitting)
      .pipe(takeUntilDestroyed(this.destroyRef), withLatestFrom(this.store.select(selectError)))
      .subscribe(([isSubmitting, error]) => {
        console.log('error', error);
        console.log('isSubmitting', isSubmitting);
        this.isFormSubmittingSubject$.next(isSubmitting);
        if (!isSubmitting) {
          this?.bookmarkErrorSubject$?.next(error);
        }
      });
  }

  onFormSubmit($event: CreateBookmarkPayload) {
    console.log('onFormSubmit', $event);
    this.store.dispatch(BookmarksActions.createBookmark({ payload: $event }));
  }

  // Handle bookmark deletion
  onDeleteBookmark(bookmark: VMBookmark) {
    console.log('onDeleteBookmark', bookmark);
  }

  onEditBookmark(bookmark: VMBookmark) {
    console.log('onEditBookmark', bookmark);
    console.log(
      'BookmarksUtils.transformSingleVMToBookmark(bookmark)',
      BookmarksUtils.transformSingleVMToBookmark(bookmark)
    );
    this.modalService.open(BookmarkFormComponent, {
      inputs: {
        bookmark: BookmarksUtils.transformSingleVMToBookmark(bookmark),
        isLoading$: this.isFormSubmitting$,
        error$: this.bookmarkError$,
      },
      outputs: {
        submitted: (data) => {
          console.log('Received:', data); // typed as string
          this.modalService.close();
        },
        closed: () => {
          console.log('Modal closed');
          this.modalService.close();
        },
      },
    });
  }
}
