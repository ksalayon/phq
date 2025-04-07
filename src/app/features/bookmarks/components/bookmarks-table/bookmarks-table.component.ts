import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { VMBookmark } from './bookmarks-table.models';
import { Bookmark } from '../../models/bookmark';
import { Observable, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { SnackbarService } from '../../../../shared/services/snackbar.service';
import { TimeAgoDetailedPipe } from '../../../../shared/pipes/time-ago-detailed.pipe';
import { BookmarksActions } from '../../state/bookmarks.actions';
import { selectBookmarksTotalCount } from '../../state/bookmarks.selectors';
import { Store } from '@ngrx/store';

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
    TimeAgoDetailedPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarksTableComponent implements AfterViewInit, OnInit, OnChanges {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Input({ required: true }) bookmarks$!: Observable<Bookmark[]>;
  @Input({ required: true }) totalCount!: number;
  // Emit an "Edit" event
  @Output() editBookmark = new EventEmitter<VMBookmark>();
  // Emit a delete event
  @Output() deleteBookmark = new EventEmitter<VMBookmark>();
  @Output() viewBookmark = new EventEmitter<VMBookmark>();
  @Output() pageChange = new EventEmitter<{ pageIndex: number; pageSize: number }>();

  displayedColumns: string[] = [
    'name',
    'url',
    'bookmarkGroupId',
    'createdAt',
    'modifiedAt',
    'actions',
  ];
  dataSource!: MatTableDataSource<Bookmark>;

  private destroyRef = inject(DestroyRef);
  private snackbarService = inject(SnackbarService);
  private store = inject(Store);

  ngOnInit(): void {
    // Initialize dataSource with available bookmarks data
    this.bookmarks$
      .pipe(
        tap((bookmarks) => {
          this.dataSource = new MatTableDataSource<Bookmark>(bookmarks);
          this.updatePaginator(); // Ensure paginator syncs with bookmarks
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    this.store
      .select(selectBookmarksTotalCount)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((count) => {
        this.totalCount = count; // Update totalCount if not set explicitly
        this.updatePaginator(); // Sync paginator when totalCount changes
      });

    // Dispatch initial load
    this.store.dispatch(BookmarksActions.loadBookmarks({ startIndex: 0, limit: 20 }));
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.updatePaginator(); // Ensure paginator length is updated properly
  }

  ngOnChanges() {
    if (this.totalCount !== undefined && this.paginator) {
      this.updatePaginator();
    }
  }

  onPageChange(event: any) {
    this.pageChange.emit({ pageIndex: event.pageIndex, pageSize: event.pageSize });
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

  private updatePaginator(): void {
    if (this.paginator) {
      this.paginator.length = this.totalCount; // Total number of records
    }
  }
}
