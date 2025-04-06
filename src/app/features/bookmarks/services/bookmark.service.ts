import { inject, Injectable } from '@angular/core';
import { from, Observable, throwError } from 'rxjs';
import {
  Bookmark,
  CreateBookmarkPayload,
  defaultBookmarkGroup,
  UpdateBookmarkPayload,
} from '../models/bookmark';
import { Store } from '@ngrx/store';
import { IndexedDbService } from './persistence/indexed-db.service';
import { selectBookmarkById } from '../state/bookmarks.selectors';
import { switchMap, take } from 'rxjs/operators';

@Injectable()
export class BookmarkService {
  private store = inject(Store);
  private indexedDbService = inject(IndexedDbService);

  constructor() {}

  getBookmarks() {
    return from(this.indexedDbService.getBookmarks());
  }

  getBookmark(id: Bookmark['id']) {
    return from(this.indexedDbService.getBookmarkById(id));
  }

  updateBookmark(bookmark: UpdateBookmarkPayload) {
    return this.store.select(selectBookmarkById(bookmark.id)).pipe(
      take(1),
      switchMap((currentBookmark) => {
        if (!currentBookmark) {
          // Throw an error if the bookmark does not exist
          return throwError(
            () => new Error(`The bookmark with ID '${bookmark.id}' does not exist`)
          );
        }

        // Compare old and new values to determine if the name or URL was updated
        const hasNameChanged = currentBookmark?.name !== bookmark.name;
        const hasUrlChanged = currentBookmark?.url !== bookmark.url;
        // sets modifiedAt to current date if there are any changes else it retains the original modifiedAt date
        const modifiedAt =
          hasNameChanged || hasUrlChanged ? new Date() : currentBookmark?.modifiedAt;
        const updatedBookmark = { ...bookmark, modifiedAt } as Bookmark;
        // Save changes to IndexedDB
        return from(this.indexedDbService.saveBookmark(updatedBookmark));
      })
    );
  }

  deleteBookmark(id: Bookmark['id']): Observable<Bookmark['id']> {
    return from(this.indexedDbService.deleteBookmark(id));
  }

  createBookmark(bookmark: CreateBookmarkPayload): Observable<Bookmark> {
    const uniqueId = crypto.randomUUID(); // Generate the unique ID for the bookmark entity
    const currentDate = new Date();
    const newBookmark = {
      ...bookmark,
      id: uniqueId,
      createdAt: currentDate,
      bookmarkGroupId: defaultBookmarkGroup.name,
    } as Bookmark;
    return from(this.indexedDbService.saveBookmark(newBookmark));
  }
}
