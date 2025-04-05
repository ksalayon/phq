import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'phq-modal-dialog',
  imports: [],
  templateUrl: './modal-dialog.component.html',
  styleUrl: './modal-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalDialogComponent {
  public title?: string;
}
