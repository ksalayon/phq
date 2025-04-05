import { Injectable } from '@angular/core';
import { of } from 'rxjs';
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
    return of(id);
  }

  createBookmark(bookmark: CreateBookmarkPayload) {
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
