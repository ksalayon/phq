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
import { BehaviorSubject, withLatestFrom } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.store
      .select(selectIsSubmitting)
      .pipe(takeUntilDestroyed(this.destroyRef), withLatestFrom(this.store.select(selectError)))
      .subscribe(([isSubmitting, error]) => {
        this.isFormSubmittingSubject$.next(isSubmitting);
      });
  }

  onFormSubmit($event: CreateBookmarkPayload) {
    console.log('onFormSubmit', $event);
    this.store.dispatch(BookmarksActions.createBookmark({ payload: $event }));
  }
}
