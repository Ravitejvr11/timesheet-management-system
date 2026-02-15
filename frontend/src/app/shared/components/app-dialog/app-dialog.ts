import {
  Component,
  input,
  output,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-dialog.html',
  styleUrl: './app-dialog.scss',
})
export class AppDialog {
  open = input<boolean>(false);
  title = input<string>('');
  _close = output<void>();

  closeDialog(): void {
    this._close.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) {
      this.closeDialog();
    }
  }
}
