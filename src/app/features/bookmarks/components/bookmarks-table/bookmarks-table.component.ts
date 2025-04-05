import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { VMBookmark } from './bookmarks-table.models';
import { Store } from '@ngrx/store';
import { selectAllBookmarks } from '../../state/bookmarks.selectors';

@Component({
  standalone: true,
  selector: 'phq-bookmarks-table',
  templateUrl: './bookmarks-table.component.html',
  styleUrls: ['./bookmarks-table.component.scss'],
  imports: [
    CommonModule, // Required for structural directives like *ngFor and *ngIf
    MatTableModule, // Provides mat-table related directives
    MatPaginatorModule, // Provides paginator functionality
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarksTableComponent implements AfterViewInit, OnInit {
  displayedColumns: string[] = ['name', 'url', 'bookmarkGroupId', 'createdAt', 'modifiedAt'];
  dataSource!: MatTableDataSource<VMBookmark>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private store = inject(Store);

  constructor() {
    // Initialize dataSource with the sample data
    // this.dataSource = new MatTableDataSource(sampleBookmarks);
  }

  ngOnInit(): void {
    this.store.select(selectAllBookmarks).subscribe((bookmarks) => {
      this.dataSource = new MatTableDataSource<VMBookmark>(
        bookmarks.map((bm) => ({
          ...bm,
          createdAt: bm.createdAt.toLocaleString(),
          modifiedAt: bm?.modifiedAt?.toLocaleString(),
        }))
      );
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }
}
