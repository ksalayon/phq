import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  EventEmitter,
  inject,
  Injectable,
  Injector,
  Type,
} from '@angular/core';
import { ModalDialogComponent } from '../components/modal-dialog/modal-dialog.component';

type OutputHandlers<T> = {
  [K in keyof T]?: T[K] extends EventEmitter<infer U> ? (event: U) => void : never;
};

/**
 * A service for managing modal dialogs within an Angular application. This service allows
 * dynamically creating, displaying, and destroying modal dialogs.
 */
@Injectable({ providedIn: 'root' })
export class ModalService {
  private appRef = inject(ApplicationRef);
  private envInjector = inject(EnvironmentInjector);
  private modalRef: ComponentRef<ModalDialogComponent> | null = null;

  /**
   * Opens a modal dialog with the specified component and options.
   *
   * @param {Type<T>} component The Angular component to display inside the modal dialog.
   * @param {{
   *   inputs?: Partial<T>,
   *   outputs?: OutputHandlers<T>
   * }} [options] Optional configuration object for the modal dialog:
   * - `inputs`: A set of key-value pairs to programmatically set `@Input()` bindings on the component instance.
   * - `outputs`: A set of key-value pairs mapping `@Output()` event names to handler functions.
   *
   * @return {void} Does not return a value.
   */
  open<T>(
    component: Type<T>,
    options?: {
      inputs?: Partial<T>;
      outputs?: OutputHandlers<T>;
    }
  ): void {
    const modalEl = document.createElement('phq-modal');
    document.body.appendChild(modalEl);
    console.log('modalEl', modalEl);
    const compRef = this.appRef.bootstrap(ModalDialogComponent, modalEl);
    compRef.instance.onClose = () => this.close();

    const injector = this.createInjector();
    compRef.instance.attachComponent(component, injector);

    // After portal attached
    const attachedRef = compRef.instance.outlet.attachedRef;
    if (attachedRef && 'instance' in attachedRef) {
      const embeddedComp = attachedRef.instance as T;

      // ✅ Programmatically set @Input()s
      Object.entries(options?.inputs ?? {}).forEach(([key, value]) => {
        (embeddedComp as any)[key] = value;
      });

      // ✅ Wire up @Output()s
      Object.entries(options?.outputs ?? {}).forEach(([key, handler]) => {
        const output = (embeddedComp as any)[key];
        if (output?.subscribe) {
          output.subscribe(handler);
        }
      });
    }

    this.modalRef = compRef;
  }

  /**
   * Creates and returns an instance of the `Injector` using the environment-specific injector.
   *
   * @return {Injector} The created injector instance.
   */
  private createInjector(): Injector {
    return this.envInjector;
  }

  /**
   * Closes the modal if it is currently open. Destroys the reference to the modal and sets it to null.
   *
   * @return {void} Nothing is returned by this method.
   */
  close(): void {
    if (this.modalRef) {
      this.modalRef.destroy();
      this.modalRef = null;
    }
  }
}
