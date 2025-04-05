import { Component } from '@angular/core';
import { BookmarkFormComponent } from '../../components/bookmark-form/bookmark-form.component';
import { CreateBookmarkPayload } from '../../models/bookmark';
import { Store } from '@ngrx/store';
import { BookmarksActions } from '../../state/bookmarks.actions';

@Component({
  standalone: true,
  selector: 'phq-bookmarks-page',
  imports: [BookmarkFormComponent],
  templateUrl: './bookmarks-page.component.html',
  styleUrl: './bookmarks-page.component.css',
})
export class BookmarksPageComponent {
  constructor(private store: Store) {}

  onFormSubmit($event: CreateBookmarkPayload) {
    this.store.dispatch(BookmarksActions.createBookmark({ payload: $event }));
  }
}
