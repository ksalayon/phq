import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BookmarkFormComponent } from '../../components/bookmark-form/bookmark-form.component';
import { CreateBookmarkPayload } from '../../models/bookmark';
import { Store } from '@ngrx/store';
import { BookmarksActions } from '../../state/bookmarks.actions';
import { BookmarksTableComponent } from '../../components/bookmarks-table/bookmarks-table.component';
import { selectError, selectIsSubmitting } from '../../state/bookmarks.selectors';
import { BehaviorSubject, withLatestFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'phq-bookmarks-page',
  imports: [BookmarkFormComponent, BookmarksTableComponent],
  templateUrl: './bookmarks-page.component.html',
  styleUrl: './bookmarks-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarksPageComponent implements OnInit {
  constructor(
    private store: Store,
    private cd: ChangeDetectorRef
  ) {}

  isFormSubmittingSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isFormSubmitting$ = this.isFormSubmittingSubject$.asObservable();

  ngOnInit() {
    this.store
      .select(selectIsSubmitting)
      .pipe(withLatestFrom(this.store.select(selectError)))
      .subscribe(([isSubmitting, error]) => {
        this.isFormSubmittingSubject$.next(isSubmitting);
      });
  }

  onFormSubmit($event: CreateBookmarkPayload) {
    console.log('onFormSubmit', $event);
    this.store.dispatch(BookmarksActions.createBookmark({ payload: $event }));
  }
}
