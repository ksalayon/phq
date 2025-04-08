import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { MIN_SEARCH_LENGTH } from './models/search-form.model';
import { MatChip } from '@angular/material/chips';

@Component({
  standalone: true,
  selector: 'phq-search-form',
  imports: [
    CommonModule,
    MatIcon,
    MatLabel,
    MatFormField,
    FormsModule,
    MatIconButton,
    MatSuffix,
    MatInput,
    MatTooltip,
    MatChip,
  ],
  templateUrl: './search-form.component.html',
  styleUrl: './search-form.component.scss',
})
export class SearchFormComponent {
  @Input() placeholder: string = 'Search';
  @Input() minCharacterLength: number = MIN_SEARCH_LENGTH;
  @Input() searchTerm: string = '';
  @Output() clearSearch: EventEmitter<void> = new EventEmitter();
  @Output() searched: EventEmitter<string> = new EventEmitter();
  searchForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      searchInput: ['', [Validators.minLength(this.minCharacterLength)]], // Requires at least 3 characters
    });
  }

  onSearchSubmit(value: string) {
    this.searched.emit(value);
  }

  onClearSearch() {
    this.clearSearch.emit();
  }
}
