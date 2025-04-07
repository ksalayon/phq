import { AfterViewInit, Directive, ElementRef, inject, Input, Renderer2 } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

/**
 * - Applies truncation styles to ensure the element content is displayed with an ellipsis if
 *   it overflows.
 * - Checks if the element's content exceeds its visible width.
 * - Enables or disables the tooltip based on whether overflow is detected.
 */
@Directive({
  selector: '[appOverflowTooltip]',
})
export class OverflowTooltipDirective implements AfterViewInit {
  @Input('appOverflowTooltip') public tooltipText = ''; // Tooltip content
  private el = inject(ElementRef);
  private matTooltip = inject(MatTooltip);
  private renderer = inject(Renderer2);

  ngAfterViewInit(): void {
    this.applyTruncateStyles();
    this.checkOverflow();
  }

  /**
   * Applies truncation styles to the native HTML element. These styles ensure that
   * the text content of the element is truncated with an ellipsis if it overflows
   * the available space.
   *
   * @return {void} This method does not return a value.
   */
  private applyTruncateStyles(): void {
    const element = this.el.nativeElement as HTMLElement;

    // Add truncation styles directly
    this.renderer.setStyle(element, 'display', 'inline-block');
    this.renderer.setStyle(element, 'max-width', '100%');
    this.renderer.setStyle(element, 'overflow', 'hidden');
    this.renderer.setStyle(element, 'white-space', 'nowrap');
    this.renderer.setStyle(element, 'text-overflow', 'ellipsis');
  }

  /**
   * Checks if the content of the element is overflowing horizontally.
   * If the content is overflowing, enables the tooltip with the specified message.
   * Otherwise, disables the tooltip.
   *
   * @return {void} This method does not return a value.
   */
  private checkOverflow(): void {
    const element = this.el.nativeElement as HTMLElement;

    // Check if the content is overflowing
    if (element.scrollWidth > element.clientWidth) {
      this.matTooltip.message = this.tooltipText; // Enable tooltip
      this.matTooltip.disabled = false;
    } else {
      this.matTooltip.disabled = true; // Disable tooltip
    }
  }
}
