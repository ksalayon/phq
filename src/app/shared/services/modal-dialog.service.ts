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

@Injectable({ providedIn: 'root' })
export class ModalService {
  private appRef = inject(ApplicationRef);
  private envInjector = inject(EnvironmentInjector);
  private modalRef: ComponentRef<ModalDialogComponent> | null = null;

  open<T>(
    component: Type<T>,
    options?: {
      inputs?: Partial<T>;
      outputs?: OutputHandlers<T>;
    }
  ) {
    const modalEl = document.createElement('phq-modal');
    document.body.appendChild(modalEl);
    console.log('modalEl', modalEl);
    const compRef = this.appRef.bootstrap(ModalDialogComponent, modalEl);
    compRef.instance.onClose = () => this.close();

    const injector = this.createInjector(options?.inputs);
    compRef.instance.attachComponent(component, injector);

    // Handle outputs safely
    const attachedRef = compRef.instance.outlet.attachedRef;
    if (attachedRef && 'instance' in attachedRef) {
      const embeddedComp = attachedRef.instance as T;
      for (const [key, handler] of Object.entries(options?.outputs ?? {})) {
        const output = (embeddedComp as any)[key];
        if (output?.subscribe) {
          output.subscribe(handler);
        }
      }
    }

    this.modalRef = compRef;
  }

  private createInjector<T>(inputs?: Partial<T>): Injector {
    return Injector.create({
      providers: Object.entries(inputs || {}).map(([key, value]) => ({
        provide: key,
        useValue: value,
      })),
      parent: this.envInjector,
    });
  }

  close() {
    if (this.modalRef) {
      this.modalRef.destroy();
      this.modalRef = null;
    }
  }
}
