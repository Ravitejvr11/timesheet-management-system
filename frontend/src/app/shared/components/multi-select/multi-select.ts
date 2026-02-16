import { CommonModule } from '@angular/common';
import type { OnDestroy, OnInit } from '@angular/core';
import {
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

export interface MultiSelectOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-multi-select',
  imports: [CommonModule],
  templateUrl: './multi-select.html',
  styleUrl: './multi-select.scss',
})
export class MultiSelect implements OnInit, OnDestroy {
  private documentClickListener?: (event: MouseEvent) => void;

  ngOnInit(): void {
    this.documentClickListener = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (!this.elementRef.nativeElement.contains(target)) {
        this.open.set(false);
      }
    };

    document.addEventListener('click', this.documentClickListener, true);
  }

  ngOnDestroy(): void {
    if (this.documentClickListener) {
      document.removeEventListener('click', this.documentClickListener, true);
    }
  }

  private elementRef = inject(ElementRef);

  options = input.required<MultiSelectOption[]>();
  selectedIds = input.required<string[]>();
  placeholder = input.required<string>();
  loading = input<boolean>(false);

  selectionChange = output<string[]>();

  open = signal(false);
  search = signal('');

  toggleDropdown(): void {
    this.open.update((v) => !v);
  }

  toggleSelection(id: string): void {
    const current = this.selectedIds();
    const updated = current.includes(id)
      ? current.filter((i) => i !== id)
      : [...current, id];

    this.selectionChange.emit(updated);
  }

  isSelected(id: string): boolean {
    return this.selectedIds().includes(id);
  }

  filteredOptions(): MultiSelectOption[] {
    const query = this.search().toLowerCase();
    return this.options().filter((o) => o.name.toLowerCase().includes(query));
  }
}
