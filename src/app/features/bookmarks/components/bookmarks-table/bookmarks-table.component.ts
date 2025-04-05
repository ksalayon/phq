import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { VMBookmark } from './bookmarks-table.models';
import { Bookmark } from '../../models/bookmark';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

  @Input({ required: true }) bookmarks$!: Observable<Bookmark[]>;

  private destroyRef = inject(DestroyRef);

  constructor() {
    // Initialize dataSource with the sample data
    // this.dataSource = new MatTableDataSource(sampleBookmarks);
  }

  ngOnInit(): void {
    this.monitorBookmarks();
  }

  private monitorBookmarks() {
    this.bookmarks$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((bookmarks) => {
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
