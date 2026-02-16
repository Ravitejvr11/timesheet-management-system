export interface TimeReportFilter {
  fromDate: string;
  toDate: string;
  employeeIds: string[];
  projectIds: number[];
}

export interface ProjectHoursSummary {
  totalBillableHours: number;
  totalNonBillableHours: number;
  totalHours: number;
  projects: ProjectBillableDto[];
}

export interface ProjectBillableDto {
  projectId: number;
  projectName: string;
  billableHours: number;
  nonBillableHours: number;
  totalHours: number;
  employees: EmployeeBillableDto[];
}

export interface EmployeeBillableDto {
  employeeId: string;
  employeeName: string;
  billableHours: number;
  nonBillableHours: number;
  totalHours: number;
}
