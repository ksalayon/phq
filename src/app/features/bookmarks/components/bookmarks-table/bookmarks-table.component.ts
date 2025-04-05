import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { sampleBookmarks } from './bookmarks.sample-data';
import { VMBookmark } from './bookmarks-table.models';

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
})
export class BookmarksTableComponent implements AfterViewInit {
  displayedColumns: string[] = ['name', 'url', 'bookmarkGroupId', 'createdAt', 'modifiedAt'];
  dataSource: MatTableDataSource<VMBookmark>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    // Initialize dataSource with the sample data
    this.dataSource = new MatTableDataSource(sampleBookmarks);
  }

  ngAfterViewInit(): void {
    // Assign MatPaginator to dataSource AFTER the view is initialized
    this.dataSource.paginator = this.paginator;
  }
}
