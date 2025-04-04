import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Bookmark, UpdateBookmarkPayload } from '../../models/bookmark';
import { NgIf } from '@angular/common';

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
    });

    if (this.bookmark) {
      this.form.patchValue({ url: this.bookmark.url });
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.formSubmitted.emit(this.form.value);
    }
  }
}
