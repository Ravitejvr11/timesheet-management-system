import type { TemplateRef } from '@angular/core';
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Spinner } from '../spinner/spinner';

export interface TableColumn<T> {
  header: string;
  field?: keyof T;
  template?: TemplateRef<{ $implicit: T }>;
  width?: string;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, Spinner],
  templateUrl: './app-table.component.html',
  styleUrl: './app-table.component.scss',
})
export class AppTable<T = unknown> {
  columns = input.required<TableColumn<T>[]>();
  data = input.required<T[]>();
  loading = input<boolean>(false);

  trackByIndex = (_: number, item: T): T => item;

  getCellValue(row: T, field?: keyof T): unknown {
    if (!field) return '';
    return row[field];
  }
}
