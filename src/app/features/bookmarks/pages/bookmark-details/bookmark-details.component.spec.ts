import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookmarkDetailsComponent } from './bookmark-details.component';

describe('BookmarkDetailComponent', () => {
  let component: BookmarkDetailsComponent;
  let fixture: ComponentFixture<BookmarkDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookmarkDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BookmarkDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
