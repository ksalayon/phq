import { EventEmitter } from '@angular/core';

/**
 * Interface representing the base structure for a form component with event emitters.
 *
 * @template T Type of the payload associated with form submission.
 */
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
