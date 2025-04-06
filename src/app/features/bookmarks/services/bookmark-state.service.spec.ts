import { TestBed } from '@angular/core/testing';

import { BookmarkStateService } from './bookmark-state.service';

describe('BookmarkStateService', () => {
  let service: BookmarkStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookmarkStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
