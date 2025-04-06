import { inject, Injectable } from '@angular/core';
import { filter, Observable, take, withLatestFrom } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectError, selectIsSubmitting } from '../state/bookmarks.selectors';
import { map } from 'rxjs/operators';

@Injectable()
export class BookmarkStateService {
  store = inject(Store);

  /**
   * Listens to submission state and error, returns an observable that emits
   * when the process completes.
   *
   * @return {Observable<{ success: boolean; error: string | null }>} Observable that emits on completion.
   */
  monitorSubmission(): Observable<{ success: boolean; error: string | null }> {
    return this.store.select(selectIsSubmitting).pipe(
      withLatestFrom(this.store.select(selectError)),
      filter(([isSubmitting]) => !isSubmitting), // Wait until submission stops
      take(1), // Take only one emission
      map(([_, error]) => ({
        success: !error,
        error,
      }))
    );
  }
}
