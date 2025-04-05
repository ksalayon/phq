import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
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
  @Input() bookmark?: Bookmark;
  @Input({ required: true }) isLoading$!: Observable<boolean>;
  @Output() submitted = new EventEmitter<UpdateBookmarkPayload>();
  @Input() error$?: Observable<string | null>;
  @Output() closed = new EventEmitter<void>();

  form!: FormGroup;
  destroyRef = inject(DestroyRef);

  constructor(private fb: FormBuilder) {}

  get urlControl() {
    return this.form.get('url');
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      url: ['', [Validators.required, BookmarksUtils.urlValidator()]],
      name: [''],
    });
    console.log('form this.bookmark', this.bookmark);
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
}
