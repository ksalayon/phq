// modal-dialog.component.ts
import { Component, Injector, Type, ViewChild } from '@angular/core';
import { CdkPortalOutlet, ComponentPortal, PortalModule } from '@angular/cdk/portal';

/**
 * Represents a modal dialog component with a backdrop and content area.
 * The dialog content can be dynamically injected and the dialog can be closed programmatically.
 * Utilizes Angular's CDK Portal to support dynamic component rendering within the modal.
 */
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
  /**
   * A variable representing a `CdkPortalOutlet` instance.
   * Used as a placeholder or container in which Angular `Portal` components
   * can dynamically render its content. It acts as an anchor point for attaching
   * portals and dynamically embedding components or templates at runtime.
   */
  @ViewChild(CdkPortalOutlet, { static: true }) outlet!: CdkPortalOutlet;
  onClose!: () => void;

  close() {
    this.onClose?.();
  }

  /**
   * Attaches a component to the outlet using the specified component type and injector.
   *
   * @param {Type<T>} component - The type of the component to attach.
   * @param {Injector} injector - The injector to use for resolving dependencies in the attached component.
   * @return {void} Does not return a value.
   */
  attachComponent<T>(component: Type<T>, injector: Injector): void {
    const portal = new ComponentPortal(component, null, injector);
    this.outlet.attachComponentPortal(portal);
  }
}
