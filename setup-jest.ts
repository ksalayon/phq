//import 'jest-preset-angular/setup-jest'; // Setup Angular support in Jest
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

// Mock global objects (if needed for your tests)
Object.defineProperty(window, 'CSS', { value: null });
Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>',
});
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    display: 'none',
    appearance: ['-webkit-appearance'],
  }),
});

globalThis.structuredClone = (val: unknown) => JSON.parse(JSON.stringify(val));
