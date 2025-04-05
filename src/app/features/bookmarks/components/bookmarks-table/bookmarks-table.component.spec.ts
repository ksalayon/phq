import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookmarksTableComponent } from './bookmarks-table.component';

describe('BookmarksTableComponent', () => {
  let component: BookmarksTableComponent;
  let fixture: ComponentFixture<BookmarksTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookmarksTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookmarksTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
