import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class BookmarkStateService {
  private submissionSubject = new Subject<{ success: boolean; error?: string; id?: string }>();

  monitorSubmission(): Observable<{ success: boolean; error?: string; id?: string }> {
    return this.submissionSubject.asObservable();
  }

  signalSubmissionSuccess(id: string): void {
    this.submissionSubject.next({ success: true, id });
  }

  signalSubmissionError(error: string): void {
    this.submissionSubject.next({ success: false, error });
  }
}
