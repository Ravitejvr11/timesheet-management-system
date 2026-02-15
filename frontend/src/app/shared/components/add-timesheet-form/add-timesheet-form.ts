import { CommonModule } from '@angular/common';
import {
  Component,
  input,
  output,
  signal,
  computed,
  inject
} from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';

import type { Project } from '@core/models/project/project.model';
import type { AddTimesheetPayload } from '@core/models/timesheet/timesheet-add.model';
import { timesheetFeature } from 'src/app/store/timesheet/timesheet.reducer';

@Component({
  selector: 'app-add-timesheet-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-timesheet-form.html',
  styleUrl: './add-timesheet-form.scss',
})
export class AddTimesheetForm {
  private store = inject(Store);

  projects = input.required<Project[]>();
  _cancel = output<void>();
  _submit = output<AddTimesheetPayload>();

  projectId = signal<number | null>(null);
  weekFrom = signal<string>('');
  weekTo = signal<string>('');
  today = new Date();

  timesheets = toSignal(
    this.store.select(timesheetFeature.selectTimesheets),
    { initialValue: [] }
  );

  minDate = computed(() => {
    const today = new Date();
    const day = today.getDay();

    const diff = day === 0 ? 1 : day === 1 ? 0 : 8 - day;

    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + diff);

    return nextMonday.toISOString().split('T')[0];
  });

  isMonday(dateString: string): boolean {
    const date = new Date(dateString);
    return date.getDay() === 1;
  }

  setWeek(dateString: string): void {
    this.weekFrom.set(dateString);

    if (!this.isMonday(dateString)) {
      this.weekTo.set('');
      return;
    }

    const start = new Date(dateString);
    const sunday = new Date(start);
    sunday.setDate(start.getDate() + 6);

    this.weekTo.set(sunday.toISOString().split('T')[0]);
  }

  // DUPLICATE CHECK
  isDuplicate = computed(() => {
    console.log("hit");

    if (!this.projectId() || !this.weekFrom() || !this.weekTo()) {
      return false;
    }

    return this.timesheets().some(t =>
      t.projectId === this.projectId() &&
      this.normalizeDate(t.weekStartDate) === this.weekFrom() &&
      this.normalizeDate(t.weekEndDate) === this.weekTo()
    );
  });

  private normalizeDate(date: string): string {
    return new Date(date).toISOString().split('T')[0];
  }

  isValid = computed(() => {
    return (
      this.projectId() !== null &&
      this.weekFrom() !== '' &&
      this.weekTo() !== '' &&
      this.isMonday(this.weekFrom()) &&
      !this.isDuplicate() // block duplicate
    );
  });

  onSubmit(): void {
    if (!this.isValid()) return;

    this._submit.emit({
      projectId: this.projectId()!,
      weekFrom: this.weekFrom(),
      weekTo: this.weekTo(),
    });
  }
}
