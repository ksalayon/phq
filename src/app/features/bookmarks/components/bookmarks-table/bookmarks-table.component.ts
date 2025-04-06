import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
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
import { BookmarksUtils } from '../../utils/bookmark.util';
import { SnackbarService } from '../../../../shared/services/snackbar.service';

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
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Input({ required: true }) bookmarks$!: Observable<Bookmark[]>;
  // Emit an "Edit" event
  @Output() editBookmark = new EventEmitter<VMBookmark>();
  // Emit a delete event
  @Output() deleteBookmark = new EventEmitter<VMBookmark>();
  @Output() viewBookmark = new EventEmitter<VMBookmark>();
  displayedColumns: string[] = [
    'name',
    'url',
    'bookmarkGroupId',
    'createdAt',
    'modifiedAt',
    'actions',
  ];
  dataSource!: MatTableDataSource<VMBookmark>;

  private destroyRef = inject(DestroyRef);
  // private snackBar = inject(MatSnackBar);
  private snackbarService = inject(SnackbarService);

  constructor() {
    // Initialize dataSource with the sample data
    // this.dataSource = new MatTableDataSource(sampleBookmarks);
  }

  ngOnInit(): void {
    this.monitorBookmarks();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  onEdit(row: VMBookmark) {
    this.editBookmark.emit(row);
  }

  onDelete(row: VMBookmark) {
    this.deleteBookmark.emit(row);
  }

  onVisit(row: VMBookmark) {
    window.open(`${row.url}`, '_blank');
  }

  onView(row: VMBookmark) {
    this.viewBookmark.emit(row);
  }

  onCopy(row: VMBookmark) {
    navigator.clipboard.writeText(row.url).then((r) => {
      this.snackbarService.success('Successfully copied url');
    });
  }

  private monitorBookmarks() {
    this.bookmarks$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((bookmarks) => {
      this.dataSource = new MatTableDataSource<VMBookmark>(
        BookmarksUtils.transformBookmarksToVM(bookmarks)
      );
      this.dataSource.paginator = this.paginator;
    });
  }
}
