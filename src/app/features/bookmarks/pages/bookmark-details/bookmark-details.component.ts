import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { selectBookmarkById } from '../../state/bookmarks.selectors'; // Selector to fetch bookmarks
import { Bookmark } from '../../models/bookmark';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'phq-bookmark-details',
  templateUrl: './bookmark-details.component.html',
  styleUrls: ['./bookmark-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, CommonModule],
})
export class BookmarkDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute); // Access the current route
  private store = inject(Store); // Access the global NGRX store

  // Observable for the selected bookmark
  bookmark$: Observable<Bookmark | undefined> | undefined;

  ngOnInit() {
    // Extract the "id" from the route and fetch the bookmark from the store
    this.bookmark$ = this.route.paramMap.pipe(
      map((paramMap) => paramMap.get('id')), // Extract the "id" parameter
      switchMap((id) => {
        if (!id) return [undefined]; // Handle invalid "id" gracefully
        return this.store.select(selectBookmarkById(id)); // Use selector to fetch the bookmark
      })
    );
  }
}
