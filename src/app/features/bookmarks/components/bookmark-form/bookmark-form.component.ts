import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostBinding,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Bookmark, UpdateBookmarkPayload } from '../../models/bookmark';
import { BookmarksUtils } from '../../utils/bookmark.util';
import { MatIcon } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BaseFormInterface } from '../../../../shared/models/base-form.interface';

/**
 * BookmarkFormComponent is a reusable form component used for creating or editing
 * bookmark entities. This component supports horizontal or vertical layout orientation
 * and allows users to input and submit bookmark data, including URL and an optional name.
 *
 * Key responsibilities include:
 * - Displaying and managing a reactive form for bookmark data.
 * - Dynamically applying the layout orientation based on the `orientation` input.
 * - Handling form submissions and emitting events with the entered data.
 */
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'phq-bookmark-form',
  styleUrls: ['./bookmark-form.component.scss'],
  templateUrl: './bookmark-form.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIcon,
    MatInputModule,
    MatButton,
    MatProgressSpinner,
  ],
})
export class BookmarkFormComponent implements OnInit, BaseFormInterface<UpdateBookmarkPayload> {
  // Reference to the 'url' input field
  @ViewChild('urlInput', { read: ElementRef }) urlInput!: ElementRef;
  /**
   * Represents an optional bookmark object.
   * This variable can hold data related to a bookmark, such as its details or settings.
   * The variable may be undefined if no bookmark exists or is not assigned.
   */
  @Input() bookmark?: Bookmark;
  /**
   * Represents an observable stream that emits the loading state as a boolean value.
   * The observable emits `true` when a loading process is active and `false` when the process is complete.
   */
  @Input({ required: true }) isLoading$!: Observable<boolean>;
  /**
   * An event emitter that emits events related to updating a bookmark.
   * This allows subscribers to listen for and handle update bookmark events.
   */
  @Output() submitted = new EventEmitter<UpdateBookmarkPayload>();
  /**
   * An optional Observable that emits either a string or null,
   * representing an error message or the absence of an error.
   */
  @Input() error$?: Observable<string | null>;
  /**
   * An event emitter that signals when a specific action or process has been completed or closed.
   */
  @Output() closed = new EventEmitter<void>();
  // Input to determine orientation of the form i.e. horizontal or vertical
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';

  form!: FormGroup;
  destroyRef = inject(DestroyRef);
  fb = inject(FormBuilder);

  // set host css class based on the orientation input
  @HostBinding('class') get orientationClass() {
    return this.orientation; // Example for orientation class
  }

  /**
   * Gets the FormControl instance associated with the 'url' field in the form.
   */
  get urlControl() {
    return this.form.get('url');
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      url: ['', [Validators.required, BookmarksUtils.urlValidator()]],
      name: [''],
    });
    if (this.bookmark) {
      this.form.patchValue({
        url: this.bookmark.url,
        name: this.bookmark.name,
      });
    }

    // Generate description only when creating a new bookmark
    if (!this.bookmark) {
      this.urlControl?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((url) => {
        const name = BookmarksUtils.generateDefaultDescription(url);
        this.form.patchValue({ name }, { emitEvent: false });
      });
    }
  }

  /**
   * Handles the form submission process. If the form is valid, it constructs
   * the payload with form data and emits a submission event.
   * Resets the form state to its initial status after submission.
   *
   * @return {void} Does not return any value.
   */
  onSubmit(): void {
    if (this.form.valid) {
      // This is used to differentiate between a create and update payload
      const payload: UpdateBookmarkPayload = {
        ...(this.bookmark?.id ? { id: this.bookmark.id } : {}),
        ...this.form.value,
      };
      this.submitted.emit(payload); //  Emit form submission event
      this.form.reset();
      this.form.markAsPristine();
      this.form.markAsUntouched(); // Ensure the form is "reset" visually
      this.form.updateValueAndValidity(); // Re-evaluate validity after reset
    }
  }

  // Public method to focus on the URL input field
  focusUrl(): void {
    if (this.urlInput) {
      this.urlInput.nativeElement.focus();
    }
  }
}
