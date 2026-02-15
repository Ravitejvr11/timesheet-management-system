import type { OnInit } from '@angular/core';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { FormArray, FormGroup } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import {
  hhmmValidator,
  max24Validator,
} from 'src/app/shared/validators/timesheet-entry.validator';
import {
  getTimesheetStatusLabel,
  getTimesheetStatusValue,
  TimesheetStatus,
  toMinutes,
} from '@core/models/timesheet/timesheet-status.util';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TimesheetActions } from 'src/app/store/timesheet/timesheet.action';
import { timesheetFeature } from 'src/app/store/timesheet/timesheet.reducer';
import type { TimesheetDetailModel } from '@core/models/timesheet/timesheet-details.model';
import { filter, map, take } from 'rxjs';
import { Spinner } from 'src/app/shared/components/spinner/spinner';
import { toSignal } from '@angular/core/rxjs-interop';

type DayFormGroup = FormGroup<{
  date: FormControl<Date>;
  billableTime: FormControl<string>;
  nonBillableTime: FormControl<string>;
}>;

@Component({
  selector: 'app-timesheet-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Spinner],
  templateUrl: './timesheet-entry.html',
  styleUrl: './timesheet-entry.scss',
})
export class TimesheetEntry implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private timesheetId = Number(this.route.snapshot.paramMap.get('id'));
  isDirtyAfterSave = signal(false);
  hasSaved = signal(false);
  loading = this.store.selectSignal(timesheetFeature.selectLoading);
  isEditable = computed(
    () =>
      getTimesheetStatusValue(this.status()) === TimesheetStatus.Approved ||
      getTimesheetStatusValue(this.status()) === TimesheetStatus.Submitted,
  );

  currentTimesheet$ = this.store.select(timesheetFeature.selectTimesheets);
  weekDays = this.generateWeek();

  private timesheet$ = this.store
    .select(timesheetFeature.selectTimesheets)
    .pipe(map((list) => list.find((t) => t.id === this.timesheetId) ?? null));

  timesheet = toSignal(this.timesheet$, { initialValue: null });
  status = computed(
    () => getTimesheetStatusLabel(this.timesheet()?.status || 1) ?? null,
  );

  form = this.fb.group({
    days: this.fb.array<DayFormGroup>([]),
  });

  actionLabel = computed(() => {
    const status = getTimesheetStatusValue(this.status());

    if (this.isDirtyAfterSave()) return 'Save';

    if (status === TimesheetStatus.Draft) return 'Save';
    if (status === TimesheetStatus.Rejected) return 'Save';
    if (status === TimesheetStatus.Approved) return null;

    return 'Save';
  });

  constructor() {
    this.initializeForm();
    effect(() => {
      if (this.isEditable()) {
        this.form.disable({ emitEvent: false });
      } else {
        this.form.enable({ emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.store.dispatch(TimesheetActions.loadProjects());
    this.store
      .select(timesheetFeature.selectTimesheets)
      .pipe(
        filter((list) => list.length > 0),
        map(
          (list) =>
            list.find((t) => t.id === this.timesheetId) as
              | TimesheetDetailModel
              | undefined,
        ),
        filter((ts): ts is TimesheetDetailModel => !!ts),
        take(1),
      )
      .subscribe((ts) => {
        this.patchForm(ts);
      });

    this.form.valueChanges.subscribe(() => {
      if (this.hasSaved()) {
        this.isDirtyAfterSave.set(true);
      }
    });
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
    const key = event.key;

    const allowed = ['ArrowLeft', 'ArrowRight', 'Tab'];
    if (allowed.includes(key)) return;

    const current = control.value || '00:00';

    // Prevent deleting format
    if (key === 'Backspace' || key === 'Delete') {
      event.preventDefault();

      let cursor = input.selectionStart ?? 0;
      if (cursor === 2) cursor--;

      const chars = current.split('');
      if (cursor >= 0 && cursor !== 2) {
        chars[cursor] = '0';
        control.setValue(chars.join(''));
        input.setSelectionRange(cursor, cursor);
      }

      return;
    }

    // Allow only digits
    if (!/^\d$/.test(key)) {
      event.preventDefault();
      return;
    }

    event.preventDefault();

    let cursor = input.selectionStart ?? 0;

    if (cursor === 2) cursor = 3;

    const chars = current.split('');
    chars[cursor] = key;

    const hours = Number(chars[0] + chars[1]);
    const minutes = Number(chars[3] + chars[4]);

    if (hours > 23) {
      chars[0] = '2';
      chars[1] = '3';
    }

    if (minutes > 59) {
      chars[3] = '5';
      chars[4] = '9';
    }

    control.setValue(chars.join(''));

    const next = cursor === 1 ? 3 : cursor + 1;
    setTimeout(() => {
      input.setSelectionRange(next, next);
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

  private toDateOnly(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private toDecimal(value: string): number {
    const minutes = toMinutes(value);
    return +(minutes / 60).toFixed(2);
  }

  saveTimesheet(): void {
    const entries = this.daysArray.controls.map((group) => ({
      workDate: this.toDateOnly(group.controls.date.value),
      billableHours: this.toDecimal(group.controls.billableTime.value),
      nonBillableHours: this.toDecimal(group.controls.nonBillableTime.value),
      description: null,
    }));

    this.store.dispatch(
      TimesheetActions.updateTimesheet({
        id: this.timesheetId,
        weekStartDate: this.toDateOnly(this.weekDays[0].date),
        weekEndDate: this.toDateOnly(this.weekDays[6].date),
        entries,
      }),
    );
    this.hasSaved.set(true);
    this.isDirtyAfterSave.set(false);
  }

  private patchForm(timesheet: TimesheetDetailModel): void {
    timesheet.entries.forEach((entry, index) => {
      const group = this.daysArray.at(index);

      group.patchValue({
        billableTime: this.decimalToHHmm(entry.billableHours),
        nonBillableTime: this.decimalToHHmm(entry.nonBillableHours),
      });
    });
  }

  private decimalToHHmm(value: number): string {
    const totalMinutes = Math.round(value * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  onTimeInput(event: Event, control: FormControl<string>): void {
    const input = event.target as HTMLInputElement;

    const cursorPos = input.selectionStart ?? 0;

    // Remove non-digits
    let digits = input.value.replace(/\D/g, '');

    // Limit to 4 digits (HHMM)
    if (digits.length > 4) {
      digits = digits.substring(0, 4);
    }

    // Auto format
    let formatted = '';

    if (digits.length <= 2) {
      formatted = digits;
    } else {
      formatted = digits.substring(0, 2) + ':' + digits.substring(2);
    }

    // Pad if needed
    if (formatted.length === 5) {
      let [h, m] = formatted.split(':').map(Number);

      if (h > 23) h = 23;
      if (m > 59) m = 59;

      formatted =
        h.toString().padStart(2, '0') + ':' + m.toString().padStart(2, '0');
    }

    control.setValue(formatted, { emitEvent: false });

    // Restore cursor naturally
    setTimeout(() => {
      input.setSelectionRange(cursorPos, cursorPos);
    });
  }

  hasDayExceeded24Hrs(): boolean {
    return this.dayTotals().some((total) => total > 1440);
  }

  submitForApproval(): void {
    this.store.dispatch(
      TimesheetActions.submitTimesheet({
        id: this.timesheetId,
      }),
    );
    this.isDirtyAfterSave.set(false);
  }
}
