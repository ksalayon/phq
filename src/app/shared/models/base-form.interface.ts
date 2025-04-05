import { EventEmitter } from '@angular/core';

export interface BaseFormInterface<T> {
  /**
   * Emits when the form is successfully submitted, passing the payload.
   */
  submitted: EventEmitter<T>;

  /**
   * Emits when the form is closed without submission, optionally passing no payload.
   */
  closed: EventEmitter<void>;
}
