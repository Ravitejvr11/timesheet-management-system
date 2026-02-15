export interface TimesheetEntryDetailModel {
  id: number;
  workDate: string;
  billableHours: number;
  nonBillableHours: number;
  description?: string | null;
}

export interface TimesheetDetailModel {
  id: number;
  projectId: number;
  weekStartDate: string;
  weekEndDate: string;
  totalBillableHours: number;
  totalNonBillableHours: number;
  status: number;
  comments?: string | null;
  entries: TimesheetEntryDetailModel[];
}
