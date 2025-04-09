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
import {
  DEFAULT_PAGE_SIZE,
  FIRST_PAGE_INDEX,
  VMBookmark,
} from '../../models/bookmarks-table.models';
import { Bookmark, CurrentPageState } from '../../models/bookmark';
import { Observable, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { TimeAgoDetailedPipe } from '../../../../shared/pipes/time-ago-detailed.pipe';
import { OverflowTooltipDirective } from '../../../../shared/directives/overflow-tooltip.directive';
import { MatTooltip } from '@angular/material/tooltip';
import { BookmarkPermissions } from './models/bookmarks-table.model';

/**
 * Represents a table component for displaying a list of bookmarks with pagination, filtering, and action menus.
 * The component allows interaction with bookmarks, supporting actions such as viewing, editing, and deleting selected bookmarks.
 * It also provides mechanisms for pagination and managing the current state of the displayed page.
 *
 * Dependencies:
 * - Angular Material modules for table, paginator, and menu components.
 * - Custom pipes and directives for formatting and UI enhancements.
 *
 *
 * Private Helper Method:
 * - updatePaginator: Synchronizes paginator configuration with the total count, current page index, and page size.
 */
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
    OverflowTooltipDirective,
    MatTooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarksTableComponent implements AfterViewInit, OnInit, OnChanges {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Input({ required: true }) bookmarks$!: Observable<Bookmark[]>;
  @Input({ required: true }) totalCount!: number;
  @Input({ required: true }) currentPageState$!: Observable<CurrentPageState>;
  @Input({ required: true }) loading$!: Observable<boolean>;
  @Input({ required: true }) permissions!: BookmarkPermissions;

  // Emit an "Edit" event
  @Output() editBookmark = new EventEmitter<VMBookmark>();
  // Emit a delete event
  @Output() deleteBookmark = new EventEmitter<VMBookmark>();
  @Output() viewBookmark = new EventEmitter<VMBookmark>();
  @Output() pageChange = new EventEmitter<{ pageIndex: number; pageSize: number }>();

  /**
   * An array of strings representing the column identifiers to be displayed in a table or similar component.
   * Properties:
   * - 'name': Represents the name or title related to the item.
   * - 'url': Denotes the URL or link associated with the item.
   * - 'bookmarkGroupId': Indicates the group or category ID to which the item belongs.
   * - 'createdAt': Refers to the creation timestamp of the item.
   * - 'modifiedAt': Refers to the last modification timestamp of the item.
   * - 'actions': Represents the column for actionable items such as edit or delete buttons.
   */
  displayedColumns: string[] = [
    'name',
    'url',
    'bookmarkGroupId',
    'createdAt',
    'modifiedAt',
    'actions',
  ];
  dataSource: MatTableDataSource<Bookmark> = new MatTableDataSource<Bookmark>([]);
  expandedRow: Bookmark | null = null;

  private destroyRef = inject(DestroyRef);
  private currentPageIndex = FIRST_PAGE_INDEX;
  private currentPageSize = DEFAULT_PAGE_SIZE;

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

    // Monitor changes in pagination state (page index and page size).
    // and ensures the paginator updates
    this.currentPageState$
      .pipe(
        tap((pageState) => {
          this.currentPageIndex = pageState.pageIndex;
          this.currentPageSize = pageState.pageSize;
          this.updatePaginator();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      this.updatePaginator(); // Ensure paginator length is updated properly
    }
  }

  ngOnChanges() {
    if (this.totalCount !== undefined && this.paginator) {
      this.updatePaginator();
    }
  }

  /**
   * Handles the page change event and emits the updated page index and page size.
   *
   * @param {any} event - The event object containing the updated pageIndex and pageSize.
   * @return {void} This method does not return a value.
   */
  onPageChange(event: any): void {
    this.pageChange.emit({ pageIndex: event.pageIndex, pageSize: event.pageSize });
  }

  /**
   * Triggers an event to notify that a bookmark is being edited.
   *
   * @param {VMBookmark} row - The bookmark object that is being edited.
   * @return {void} Does not return a value.
   */
  onEdit(row: VMBookmark): void {
    this.editBookmark.emit(row);
  }

  /**
   * Handles the deletion of a bookmark by emitting the specified bookmark row.
   *
   * @param {VMBookmark} row - The bookmark row to be deleted.
   * @return {void} Does not return a value.
   */
  onDelete(row: VMBookmark): void {
    this.deleteBookmark.emit(row);
  }

  /**
   * Opens the provided bookmark's URL in a new browser tab.
   *
   * @param {VMBookmark} row - The bookmark object containing the URL to be opened.
   * @return {void} This method does not return a value.
   */
  onVisit(row: VMBookmark): void {
    window.open(`${row.url}`, '_blank');
  }

  /**
   * Triggers the viewBookmark event by emitting the provided row.
   *
   * @param {VMBookmark} row - The data object representing the bookmark to be viewed.
   * @return {void} This method does not return any value.
   */
  onView(row: VMBookmark): void {
    this.viewBookmark.emit(row);
  }

  // Triggered when the mat-menu is opened
  onMenuOpen(row: Bookmark): void {
    this.expandedRow = row;
  }

  // Triggered when the mat-menu is closed
  onMenuClose(): void {
    this.expandedRow = null;
  }

  /**
   * Updates the paginator's length, page index, and page size based on the current values.
   * Ensures the paginator reflects the total record count and current pagination state.
   *
   * @return {void}
   */
  private updatePaginator(): void {
    if (this.paginator) {
      this.paginator.length = this.totalCount; // Total number of records
      this.paginator.pageIndex = this.currentPageIndex ?? this.paginator.pageIndex;
      this.paginator.pageSize = this.currentPageSize ?? this.paginator.pageSize;
    }
  }
}
