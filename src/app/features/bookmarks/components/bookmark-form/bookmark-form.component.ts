import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Bookmark, UpdateBookmarkPayload } from '../../models/bookmark';
import { BookmarksUtils } from '../../utils';
import { MatIcon } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Observable } from 'rxjs';

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
export class BookmarkFormComponent implements OnInit {
  @Input() bookmark?: Bookmark;
  @Input({ required: true }) isLoading$!: Observable<boolean>;
  @Output() formSubmitted = new EventEmitter<UpdateBookmarkPayload>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  get urlControl() {
    return this.form.get('url');
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      url: ['', [Validators.required, BookmarksUtils.urlValidator()]],
      name: [''],
    });

    if (this.bookmark) {
      this.form.patchValue({ url: this.bookmark.url });
    }

    // Generate description dynamically based on URL changes
    this.urlControl?.valueChanges.subscribe((url) => {
      const name = BookmarksUtils.generateDefaultDescription(url);
      this.form.patchValue({ name }, { emitEvent: false });
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.formSubmitted.emit(this.form.value); //  Emit form submission event
      this.form.reset();
      this.form.markAsPristine();
      this.form.markAsUntouched(); // Ensure the form is "reset" visually
      this.form.updateValueAndValidity(); // Re-evaluate validity after reset
    }
  }
}
