import type { DayFormValue } from './timesheet-entries.model';
import type { TimesheetStatus } from './timesheet-status.util';

export interface ManagerTimesheet {
  id: number;
  projectId: number;
  projectName: string;
  projectCode: string;
  clientName: string;
  employeeId: string;
  employeeName: string;
  weekStartDate: string;
  weekEndDate: string;
  totalBillableHours: number;
  totalNonBillableHours: number;
  status: TimesheetStatus;
  comments?: string | null;
  entries: DayFormValue[];
}
