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
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  selector: 'phq-bookmarks-table',
  templateUrl: './bookmarks-table.component.html',
  styleUrls: ['./bookmarks-table.component.scss'],
  imports: [
    CommonModule, // Required for structural directives like *ngFor and *ngIf
    MatTableModule, // Provides mat-table related directives
    MatPaginatorModule, // Provides paginator functionality
    MatMenu, // The following is needed for the Action menu for individual rows under the "Actions" column
    MatIcon,
    MatMenuItem,
    MatMenuTrigger,
    MatIconButton,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarksTableComponent implements AfterViewInit, OnInit {
  displayedColumns: string[] = [
    'name',
    'url',
    'bookmarkGroupId',
    'createdAt',
    'modifiedAt',
    'actions',
  ];
  dataSource!: MatTableDataSource<VMBookmark>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @Input({ required: true }) bookmarks$!: Observable<Bookmark[]>;

  private destroyRef = inject(DestroyRef);
  private snackBar = inject(MatSnackBar);

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

  onEdit(row: any) {
    console.log('Edit', row);
  }

  onDelete(row: any) {
    console.log('Delete', row);
  }

  onVisit(row: VMBookmark) {
    window.open(`${row.url}`, '_blank');
  }

  onCopy(row: VMBookmark) {
    navigator.clipboard.writeText(row.url).then((r) => {
      console.log('copied!');
      this.snackBar.open('Successfully copied url', '', {
        duration: 3000,
      });
    });
  }
}
