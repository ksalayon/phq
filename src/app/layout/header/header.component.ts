import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { NgForOf } from '@angular/common';
import { HeaderNavItem } from './models/HeaderComponentModels';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'phq-header',
  imports: [MatToolbar, RouterLink, NgForOf, MatDivider],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Input() navLinks: HeaderNavItem[] = [];
}
