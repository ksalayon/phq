import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { NgForOf } from '@angular/common';
import { HeaderNavItem } from './models/HeaderComponentModels';

@Component({
  selector: 'phq-header',
  imports: [MatToolbar, RouterLink, NgForOf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Input() navLinks: HeaderNavItem[] = [];
}
