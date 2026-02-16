import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import type { TimesheetRow } from '@core/models/timesheet/timesheet-row.model';
import type { TimesheetFilterEmployee } from '@core/models/timesheet/timesheet-filter.model';
import {
  TimesheetStatus,
  getTimesheetStatusClass,
  getTimesheetStatusLabel,
} from '@core/models/timesheet/timesheet-status.util';
import { Spinner } from '../spinner/spinner';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-timesheet-table',
  standalone: true,
  imports: [CommonModule, Spinner, RouterModule],
  templateUrl: './timesheet-table.html',
  styleUrl: './timesheet-table.scss',
})
export class TimesheetTable {
  private elementRef = inject(ElementRef);

  dataSource = input.required<TimesheetRow[]>();
  filterChange = output<TimesheetFilterEmployee>();
  loading = input<boolean>(false);

  search = signal<string>('');
  weekFrom = signal<string>('');
  weekTo = signal<string>('');
  status = signal<string>('');
  submitted = signal<string>('');
  approved = signal<string>('');

  activeFilter = signal<string | null>(null);

  statusOptions = Object.keys(TimesheetStatus)
    .filter((key) => isNaN(Number(key)))
    .map((key) => ({
      label: key,
      value: TimesheetStatus[key as keyof typeof TimesheetStatus],
    }));

  toggleFilter(column: string): void {
    this.activeFilter.update((current) => (current === column ? null : column));
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.activeFilter.set(null);
    }
  }

  emitFilters(): void {
    const filters: TimesheetFilterEmployee = {
      search: this.search(),
      weekFrom: this.weekFrom(),
      weekTo: this.weekTo(),
      status: this.status(),
      submitted: this.submitted(),
      approved: this.approved(),
    };

    this.filterChange.emit(filters);
  }

  getTotalHours(row: TimesheetRow): number {
    const total = row.totalBillableHours + row.totalNonBillableHours;
    return Math.round(total * 100) / 100;
  }

  getStatusLabel(status: number): string {
    return getTimesheetStatusLabel(status);
  }

  getStatusClass(status: number): string {
    return getTimesheetStatusClass(status);
  }
}
