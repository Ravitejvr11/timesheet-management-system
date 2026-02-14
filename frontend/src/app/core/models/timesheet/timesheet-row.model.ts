export interface TimesheetRow {
  id: number;

  projectCode: string;
  projectName: string;

  weekStartDate: string;
  weekEndDate: string;

  status: number;

  submittedAt?: string | null;
  approvedAt?: string | null;

  totalBillableHours: number;
  totalNonBillableHours: number;
  totalHours: number;
}
