import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { Bookmark, UpdateBookmarkPayload } from '../models/bookmark';

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
    return of(bookmark);
  }

  deleteBookmark(id: Bookmark['id']) {
    return of(id);
  }

  createBookmark(bookmark: Bookmark) {
    return of(bookmark);
  }
}
