import type { FormControl, FormGroup } from "@angular/forms";

export interface DayFormValue {
  date: Date;
  billableHours: number;
  nonBillableHours: number;
}

export interface TimesheetFormValue {
  days: DayFormValue[];
}

export type DayFormGroup = FormGroup<{
  date: FormControl<Date>;
  billableHours: FormControl<number>;
  nonBillableHours: FormControl<number>;
}>;
