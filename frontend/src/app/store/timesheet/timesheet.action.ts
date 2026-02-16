import { createActionGroup, emptyProps, props } from '@ngrx/store';
import type { Project } from '@core/models/project/project.model';
import type { TimesheetViewModel } from '@core/models/timesheet/timesheetViewModel';
import type { TimesheetDetailModel } from '@core/models/timesheet/timesheet-details.model';
import type { AddTimesheetPayload } from '@core/models/timesheet/timesheet-add.model';
import type { ManagerTimesheet } from '@core/models/timesheet/manager-timesheet.model';
import type { ProjectHoursSummary, TimeReportFilter } from '@core/models/reports/project-hours-summay.model';

export const TimesheetActions = createActionGroup({
  source: 'Timesheet',
  events: {
    'Load Projects': emptyProps(),
    'Load Projects Success': props<{ projects: Project[] }>(),
    'Load Projects Failure': props<{ error: string }>(),

    'Load Timesheets': props<{ projectId: number }>(),
    'Load Timesheets Success': props<{
      timesheets: TimesheetViewModel[];
    }>(),
    'Load Timesheets Failure': props<{ error: string }>(),

    'Select Project': props<{ projectId: number }>(),
    'Create Timesheet': props<{
      projectId: number;
      weekStartDate: string;
      weekEndDate: string;
    }>(),

    'Create Timesheet Success': props<{ timesheet?: AddTimesheetPayload }>(),

    'Create Timesheet Failure': props<{ error: string }>(),

    'Update Timesheet': props<{
      id: number;
      weekStartDate: string;
      weekEndDate: string;
      entries: {
        workDate: string;
        billableHours: number;
        nonBillableHours: number;
        description?: string | null;
      }[];
    }>(),

    'Update Timesheet Success': props<{
      timesheet: TimesheetDetailModel;
    }>(),

    'Update Timesheet Failure': props<{ error: string }>(),

    'Submit Timesheet': props<{ id: number }>(),

    'Submit Timesheet Success': props<{ id: number }>(),
    'Submit Timesheet Failure': props<{ error: string }>(),

    'Load Manager Timesheets': emptyProps(),
    'Load Manager Timesheets Success': props<{
      timesheets: ManagerTimesheet[];
    }>(),
    'Load Manager Timesheets Failure': props<{ error: string }>(),

    'Approve Timesheet': props<{ id: number }>(),
    'Approve Timesheet Success': props<{ id: number }>(),
    'Approve Timesheet Failure': props<{ error: string }>(),

    'Reject Timesheet': props<{ id: number; comments: string }>(),
    'Reject Timesheet Success': props<{ id: number; comments: string }>(),
    'Reject Timesheet Failure': props<{ error: string }>(),

    'Load Report Summary': props<{ filter: TimeReportFilter }>(),
    'Load Report Summary Success': props<{ summary: ProjectHoursSummary }>(),
    'Load Report Summary Failure': props<{ error: string }>(),

  },
});
