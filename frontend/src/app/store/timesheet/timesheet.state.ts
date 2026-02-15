import type { Project } from '@core/models/project/project.model';
import type { TimesheetViewModel } from '@core/models/timesheet/timesheetViewModel';

export interface TimesheetState {
  projects: Project[];
  timesheets: TimesheetViewModel[];
  selectedProjectId: number | null;

  loading: boolean;
  error: string | null;
}

export const initialTimesheetState: TimesheetState = {
  projects: [],
  timesheets: [],
  selectedProjectId: null,

  loading: false,
  error: null,
};
