import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Bookmark, UpdateBookmarkPayload } from '../../models/bookmark';
import { NgIf } from '@angular/common';
import { BookmarksUtils } from '../../utils';

@Component({
  standalone: true,
  selector: 'phq-bookmark-form',
  styleUrls: ['./bookmark-form.component.scss'],
  templateUrl: './bookmark-form.component.html',
  imports: [ReactiveFormsModule, NgIf],
})
export class BookmarkFormComponent implements OnInit {
  @Input() bookmark?: Bookmark;
  @Output() formSubmitted = new EventEmitter<UpdateBookmarkPayload>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  get urlControl() {
    return this.form.get('url');
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      url: ['', [Validators.required, Validators.pattern(/https?:\/\/.+/)]],
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
      this.formSubmitted.emit(this.form.value);
    }
  }
}
