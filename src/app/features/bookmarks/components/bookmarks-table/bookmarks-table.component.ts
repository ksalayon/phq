import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { Bookmark } from '../../models/bookmark';

export interface VMBookmark extends Omit<Bookmark, 'createdAt' | 'modifiedAt'> {
  createdAt: string; // A more user-friendly format for createdAt
  modifiedAt: string; // A more user-friendly format for modifiedAt
}

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
export class BookmarksTableComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'url', 'bookmarkGroupId', 'createdAt', 'modifiedAt'];
  dataSource: MatTableDataSource<VMBookmark>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    const sampleData: VMBookmark[] = [
      {
        id: '111',
        name: 'Google',
        url: 'https://google.com',
        bookmarkGroupId: 'Search Engines',
        createdAt: 'October 10, 2023',
        modifiedAt: 'October 12, 2023',
      },
      {
        id: '112',
        name: 'YouTube',
        url: 'https://youtube.com',
        bookmarkGroupId: 'Videos',
        createdAt: 'October 11, 2023',
        modifiedAt: 'October 13, 2023',
      },
      {
        id: '113',
        name: 'Facebook',
        url: 'https://facebook.com',
        bookmarkGroupId: 'Social Media',
        createdAt: 'October 9, 2023',
        modifiedAt: 'October 11, 2023',
      },
      {
        id: '114',
        name: 'Twitter',
        url: 'https://twitter.com',
        bookmarkGroupId: 'Social Media',
        createdAt: 'October 8, 2023',
        modifiedAt: 'October 10, 2023',
      },
      {
        id: '115',
        name: 'GitHub',
        url: 'https://github.com',
        bookmarkGroupId: 'Development',
        createdAt: 'October 7, 2023',
        modifiedAt: 'October 9, 2023',
      },
      {
        id: '116',
        name: 'Stack Overflow',
        url: 'https://stackoverflow.com',
        bookmarkGroupId: 'Development',
        createdAt: 'October 6, 2023',
        modifiedAt: 'October 8, 2023',
      },
      {
        id: '117',
        name: 'Amazon',
        url: 'https://amazon.com',
        bookmarkGroupId: 'Shopping',
        createdAt: 'October 5, 2023',
        modifiedAt: 'October 7, 2023',
      },
    ];

    // Initialize dataSource with the sample data
    this.dataSource = new MatTableDataSource(sampleData);
  }

  ngOnInit(): void {
    console.log('Table Initialized with displayedColumns:', this.displayedColumns);
    console.log('Table Initialized with displayedColumns:', this.dataSource);
  }

  ngAfterViewInit(): void {
    // Assign MatPaginator to dataSource AFTER the view is initialized
    this.dataSource.paginator = this.paginator;
  }
}
