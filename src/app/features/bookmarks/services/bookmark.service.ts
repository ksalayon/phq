import { inject, Injectable } from '@angular/core';
import { from, Observable, throwError } from 'rxjs';
import {
  Bookmark,
  CreateBookmarkPayload,
  defaultBookmarkGroup,
  UpdateBookmarkPayload,
} from '../models/bookmark';
import { IndexedDbService } from './persistence/indexed-db.service';
import { switchMap, take } from 'rxjs/operators';

@Injectable()
export class BookmarkService {
  private indexedDbService = inject(IndexedDbService);

  constructor() {}

  getBookmarksPaginated(startIndex: number, limit: number) {
    return from(this.indexedDbService.getBookmarks(startIndex, limit));
  }

  getBookmarksCount() {
    return from(this.indexedDbService.getBookmarksCount());
  }

  getBookmark(id: Bookmark['id']) {
    return from(this.indexedDbService.getBookmarkById(id));
  }

  updateBookmark(bookmark: UpdateBookmarkPayload) {
    // check if an entry in the store already has the url from the update payload
    return from(this.indexedDbService.getBookmarkByUrl(bookmark.url)).pipe(
      take(1),
      switchMap((existingBookmark) => {
        if (
          existingBookmark &&
          existingBookmark.url === bookmark.url &&
          existingBookmark.id !== bookmark.id
        ) {
          // Throw an error if the bookmark does not exist
          return throwError(() => new Error(`The bookmark with the same name already exists`));
        }
        return from(this.indexedDbService.getBookmarkById(bookmark.id));
      }),
      switchMap((bookmarkToUpdate) => {
        if (!bookmarkToUpdate) {
          // Throw an error if the bookmark does not exist
          return throwError(
            () => new Error(`The bookmark with ID '${bookmark.id}' does not exist`)
          );
        }
        // Compare old and new values to determine if the name or URL was updated
        const hasNameChanged = bookmarkToUpdate?.name !== bookmark.name;
        const hasUrlChanged = bookmarkToUpdate?.url !== bookmark.url;
        // sets modifiedAt to current date if there are any changes else it retains the original modifiedAt date
        const modifiedAt =
          hasNameChanged || hasUrlChanged ? new Date() : bookmarkToUpdate?.modifiedAt;
        const updatedBookmark = { ...bookmarkToUpdate, ...bookmark, modifiedAt } as Bookmark;
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
