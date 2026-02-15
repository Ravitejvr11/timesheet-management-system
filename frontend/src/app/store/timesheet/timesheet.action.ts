import { createActionGroup, emptyProps, props } from '@ngrx/store';
import type { Project } from '@core/models/project/project.model';
import type { TimesheetViewModel } from '@core/models/timesheet/timesheetViewModel';

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

    'Create Timesheet Success': emptyProps(),

    'Create Timesheet Failure': props<{ error: string }>(),
  },
});
