import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BaseFormInterface } from '../../../../shared/models/base-form.interface';
import { Bookmark } from '../../models/bookmark';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';

/**
 * ConfirmDeleteDialogComponent is a standalone Angular component that provides a user interface
 * for confirming or canceling a delete operation for a bookmark entry.
 *
 * This dialog allows users to either confirm the deletion of a specified item, represented by
 * the `bookmark` input property, or to cancel the operation.
 *
 * The component implements the BaseFormInterface for handling interactions tied to Bookmark data.
 */
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'phq-confirm-delete-dialog',
  imports: [MatButton, MatCard, MatCardContent],
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrl: './confirm-delete-dialog.component.scss',
})
export class ConfirmDeleteDialogComponent implements BaseFormInterface<Bookmark> {
  @Output() closed: EventEmitter<void> = new EventEmitter();
  @Output() submitted: EventEmitter<Bookmark> = new EventEmitter();
  @Input({ required: true }) bookmark!: Bookmark;

  /**
   * Confirms and emits the bookmark for further processing or handling.
   *
   * @return {void} This method does not return a value.
   */
  confirm(): void {
    // Emit or handle confirmation logic
    this.submitted.emit(this.bookmark);
  }

  /**
   * Cancels the current operation and emits a close event.
   *
   * @return {void} Does not return any value.
   */
  cancel(): void {
    // Emit or handle cancel logic
    this.closed.emit();
  }
}
