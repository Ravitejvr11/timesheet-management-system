import { Component, input } from '@angular/core';

@Component({
  selector: 'app-timesheet-stats',
  imports: [],
  templateUrl: './timesheet-stats.html',
  styleUrl: './timesheet-stats.scss',
})
export class TimesheetStats {
  totalBillableHours = input.required<number>();
  totalNonBillableHours = input.required<number>();
  totalWeeks = input.required<number>();
  totalProjects = input.required<number>();
}
