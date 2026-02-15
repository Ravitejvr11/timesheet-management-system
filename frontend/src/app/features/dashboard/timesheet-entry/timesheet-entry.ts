import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { FormArray, FormGroup } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import {
  hhmmValidator,
  max24Validator,
} from 'src/app/shared/validators/timesheet-entry.validator';
import { toMinutes } from '@core/models/timesheet/timesheet-status.util';
import { Router } from '@angular/router';

type DayFormGroup = FormGroup<{
  date: FormControl<Date>;
  billableTime: FormControl<string>;
  nonBillableTime: FormControl<string>;
}>;

@Component({
  selector: 'app-timesheet-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './timesheet-entry.html',
  styleUrl: './timesheet-entry.scss',
})
export class TimesheetEntry {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  weekDays = this.generateWeek();

  form = this.fb.group({
    days: this.fb.array<DayFormGroup>([]),
  });

  constructor() {
    this.initializeForm();
  }

  get daysArray(): FormArray<DayFormGroup> {
    return this.form.get('days') as FormArray<DayFormGroup>;
  }

  private generateWeek(): { label: string; date: Date }[] {
    const today = new Date();
    const monday = this.getMonday(today);

    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);

      return {
        label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        date,
      };
    });
  }

  private getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  private initializeForm(): void {
    this.weekDays.forEach((day, index) => {
      const isWeekend = index >= 5;

      this.daysArray.push(
        this.fb.group(
          {
            date: new FormControl<Date>(day.date, { nonNullable: true }),

            billableTime: new FormControl<string>('00:00', {
              nonNullable: true,
              validators: [hhmmValidator],
            }),

            nonBillableTime: new FormControl<string>(
              { value: '00:00', disabled: isWeekend },
              { nonNullable: true, validators: [hhmmValidator] },
            ),
          },
          {
            validators: [max24Validator],
          },
        ) as DayFormGroup,
      );
    });
  }

  onKeyDown(event: KeyboardEvent, control: FormControl<string>): void {
    const input = event.target as HTMLInputElement;

    const allowed = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];

    if (allowed.includes(event.key)) return;

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    event.preventDefault();

    const current = control.value ?? '00:00';
    const chars = current.split('');
    let cursor = input.selectionStart ?? 0;

    if (cursor === 2) cursor = 3;

    if (cursor !== 2) {
      chars[cursor] = event.key;
    }

    const updated = chars.join('');
    const [h, m] = updated.split(':').map(Number);

    if (h > 23 || m > 59) return;

    control.setValue(updated);

    const nextPos = cursor === 1 ? 3 : cursor + 1;

    setTimeout(() => {
      input.setSelectionRange(nextPos, nextPos);
    });
  }

  dayTotals(): number[] {
    return this.daysArray.controls.map((group) => {
      const billable = toMinutes(group.controls.billableTime.value);
      const nonBillable = toMinutes(group.controls.nonBillableTime.value);

      return billable + nonBillable;
    });
  }

  grandTotal(): number {
    return this.dayTotals().reduce((sum, val) => sum + val, 0);
  }

  formatMinutes(minutes: number): string {
    if (!minutes || isNaN(minutes)) {
      return '00:00';
    }

    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  hasAnyEntry(): boolean {
    return this.daysArray.controls.some((group) => {
      const b = group.controls.billableTime.value;
      const n = group.controls.nonBillableTime.value;

      return b !== '00:00' || n !== '00:00';
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
