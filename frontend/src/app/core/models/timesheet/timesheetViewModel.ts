export interface TimesheetViewModel {
  id: number;
  projectId: number;
  weekStartDate: string;
  weekEndDate: string;
  totalBillableHours: number;
  totalNonBillableHours: number;
  status: number;
  submittedAt?: string | null;
  approvedAt?: string | null;
}
