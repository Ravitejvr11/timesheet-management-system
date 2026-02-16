import type { Project } from '@core/models/project/project.model';
import type { ProjectHoursSummary } from '@core/models/reports/project-hours-summay.model';
import type { ManagerTimesheet } from '@core/models/timesheet/manager-timesheet.model';
import type { TimesheetDetailModel } from '@core/models/timesheet/timesheet-details.model';
import type { TimesheetViewModel } from '@core/models/timesheet/timesheetViewModel';

export interface TimesheetState {
  projects: Project[];
  timesheets: TimesheetViewModel[];
  selectedProjectId: number | null;

  selectedTimesheet: TimesheetDetailModel | null;

  loading: boolean;
  error: string | null;
  managerTimesheets: ManagerTimesheet[];
  managerLoading: boolean;
  approvalLoading: boolean;
  reportSummary: ProjectHoursSummary | null;
  reportLoading: boolean;
}

export const initialTimesheetState: TimesheetState = {
  projects: [],
  timesheets: [],
  selectedProjectId: null,

  selectedTimesheet: null,

  loading: false,
  error: null,
  managerTimesheets: [],
  managerLoading: false,
  approvalLoading: false,
  reportSummary: null,
  reportLoading: false,
};

export interface UpdateTimesheetRequest {
  weekStartDate: string;
  weekEndDate: string;
  entries: {
    workDate: string;
    billableHours: number;
    nonBillableHours: number;
    description?: string | null;
  }[];
}
