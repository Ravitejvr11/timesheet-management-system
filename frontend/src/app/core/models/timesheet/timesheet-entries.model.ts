import type { FormControl, FormGroup } from "@angular/forms";

export interface DayFormValue {
  id?: number;
  date: Date;
  billableHours: number;
  nonBillableHours: number;
  workDate?: number
}

export interface TimesheetFormValue {
  days: DayFormValue[];
}

export type DayFormGroup = FormGroup<{
  date: FormControl<Date>;
  billableHours: FormControl<number>;
  nonBillableHours: FormControl<number>;
}>;
