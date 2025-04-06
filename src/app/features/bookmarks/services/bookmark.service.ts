import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  Bookmark,
  CreateBookmarkPayload,
  defaultBookmarkGroup,
  UpdateBookmarkPayload,
} from '../models/bookmark';

@Injectable()
export class BookmarkService {
  constructor() {}

  getBookmarks() {
    return of([] as Bookmark[]);
  }

  getBookmark(id: Bookmark['id']) {
    return of({} as Bookmark);
  }

  updateBookmark(bookmark: UpdateBookmarkPayload) {
    return of(bookmark as Bookmark);
  }

  deleteBookmark(id: Bookmark['id']) {
    // const failed = true;
    // if (failed) {
    //   return throwError(() => new Error('No deletion handling for now'));
    // }
    return of(id);
  }

  createBookmark(bookmark: CreateBookmarkPayload): Observable<Bookmark> {
    const uniqueId = crypto.randomUUID(); // Generate the unique ID for the bookmark entity
    const currentDate = new Date();
    return of({
      ...bookmark,
      id: uniqueId,
      createdAt: currentDate,
      bookmarkGroupId: defaultBookmarkGroup.name,
    } as Bookmark);
  }
}
