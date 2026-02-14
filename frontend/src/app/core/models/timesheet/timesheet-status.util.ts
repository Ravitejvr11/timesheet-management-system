export enum TimesheetStatus {
  Draft = 0,
  Submitted = 1,
  Approved = 2,
  Rejected = 3,
}

export function getTimesheetStatusLabel(status: number): string {
  switch (status) {
    case TimesheetStatus.Draft:
      return 'Draft';
    case TimesheetStatus.Submitted:
      return 'Submitted';
    case TimesheetStatus.Approved:
      return 'Approved';
    case TimesheetStatus.Rejected:
      return 'Rejected';
    default:
      return 'Unknown';
  }
}

export function getTimesheetStatusClass(status: number): string {
  switch (status) {
    case TimesheetStatus.Submitted:
      return 'pending';
    case TimesheetStatus.Approved:
      return 'approved';
    case TimesheetStatus.Rejected:
      return 'rejected';
    default:
      return 'draft';
  }
}
