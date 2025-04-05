// modal-dialog.component.ts
import { Component, Injector, Type, ViewChild } from '@angular/core';
import { CdkPortalOutlet, ComponentPortal, PortalModule } from '@angular/cdk/portal';

@Component({
  selector: 'phq-modal',
  standalone: true,
  imports: [PortalModule],
  template: `
    <div class="modal-backdrop" (click)="close()"></div>
    <div class="modal-content">
      <ng-template cdkPortalOutlet></ng-template>
    </div>
  `,
  styleUrls: ['./modal-dialog.component.scss'],
})
export class ModalDialogComponent {
  @ViewChild(CdkPortalOutlet, { static: true }) outlet!: CdkPortalOutlet;
  onClose!: () => void;

  close() {
    this.onClose?.();
  }

  attachComponent<T>(component: Type<T>, injector: Injector) {
    const portal = new ComponentPortal(component, null, injector);
    this.outlet.attachComponentPortal(portal);
  }
}
