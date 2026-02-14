import { CommonModule } from '@angular/common';
import { Component, HostListener, input, output } from '@angular/core';

@Component({
  selector: 'app-dialog',
  imports: [CommonModule],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
})
export class Dialog {
  isOpen = input<boolean>(false);
  closed = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.closed.emit();
    }
  }

  onBackdropClick(): void {
    this.closed.emit();
  }
}
