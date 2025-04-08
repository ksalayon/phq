import { inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  selectBookmarksTotalCount,
  selectCurrentPageBookmarks,
  selectCurrentPageState,
  selectLoading,
} from '../state/bookmarks.selectors';
import { BookmarksActions } from '../state/bookmarks.actions';
import {
  BookmarksSearchParams,
  CreateBookmarkPayload,
  UpdateBookmarkPayload,
} from '../models/bookmark';

/**
 * Service responsible for managing the state of bookmark submission events and their notifications.
 * It provides methods to monitor submission events, and signal success or error states.
 */
@Injectable()
export class BookmarkStateService {
  private submissionSubject = new Subject<{ success: boolean; error?: string; id?: string }>();
  private store = inject(Store);

  /**
   * Monitors the status of a submission and provides updates as an observable.
   *
   * @return {Observable<{ success: boolean; error?: string; id?: string }>} An observable that emits submission status updates, including
   * whether the submission was successful, an optional error message, and an optional submission ID.
   */
  monitorSubmission(): Observable<{ success: boolean; error?: string; id?: string }> {
    return this.submissionSubject.asObservable();
  }

  /**
   * Signals that a submission was successful by emitting the status and ID.
   *
   * @param {string} id - The unique identifier of the successful submission.
   * @return {void} This method does not return a value.
   */
  signalSubmissionSuccess(id: string): void {
    this.submissionSubject.next({ success: true, id });
  }

  /**
   * Handles submission errors by signaling the error message.
   *
   * @param {string} error - The error message to be propagated.
   * @return {void} Does not return any value.
   */
  signalSubmissionError(error: string): void {
    this.submissionSubject.next({ success: false, error });
  }

  selectLoading$() {
    return this.store.select(selectLoading);
  }

  selectCurrentPageState$() {
    return this.store.select(selectCurrentPageState);
  }

  selectCurrentPageBookmarks$(pageIndex: number, pageSize: number) {
    return this.store.select(selectCurrentPageBookmarks(pageIndex, pageSize));
  }

  selectBookmarksTotalCount$() {
    return this.store.select(selectBookmarksTotalCount);
  }

  searchBookmarksByUrl$(searchParam: BookmarksSearchParams) {
    this.store.dispatch(BookmarksActions.searchBookmarksByUrl({ payload: searchParam }));
  }

  loadBookmarks(pageIndex: number, pageSize: number) {
    this.store.dispatch(
      BookmarksActions.loadBookmarks({
        startIndex: pageIndex * pageSize,
        limit: pageSize,
      })
    );
  }

  saveCurrentPageState(pageIndex: number, pageSize: number) {
    this.store.dispatch(
      BookmarksActions.saveCurrentPageState({
        pageIndex: pageIndex,
        pageSize: pageSize,
      })
    );
  }

  createBookmark(payload: CreateBookmarkPayload) {
    this.store.dispatch(BookmarksActions.createBookmark({ payload }));
  }

  deleteBookmark(id: string) {
    this.store.dispatch(BookmarksActions.deleteBookmark({ id }));
  }

  updateBookmark(payload: UpdateBookmarkPayload) {
    this.store.dispatch(BookmarksActions.updateBookmark({ payload }));
  }

  getBookmarkSearchResultCount(search: string) {
    this.store.dispatch(BookmarksActions.getBookmarkSearchResultCount({ search }));
  }
}
