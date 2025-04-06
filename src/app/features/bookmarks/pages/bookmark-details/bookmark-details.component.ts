import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  selector: 'phq-bookmark-details',
  imports: [],
  templateUrl: './bookmark-details.component.html',
  styleUrl: './bookmark-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarkDetailsComponent implements OnInit {
  ngOnInit() {
    console.log('BookmarkDetailsComponent');
  }
}
