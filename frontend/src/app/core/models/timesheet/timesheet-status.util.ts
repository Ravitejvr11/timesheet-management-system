export enum TimesheetStatus {
    Draft = 1,
    Submitted = 2,
    Approved = 3,
    Rejected = 4
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

export function getTimesheetStatusValue(status: string): number {
  switch (status) {
    case 'Draft':
      return TimesheetStatus.Draft;
    case 'Submitted':
      return TimesheetStatus.Submitted;
    case 'Approved':
      return TimesheetStatus.Approved;
    case 'Rejected':
      return TimesheetStatus.Rejected;
    default:
      return 0; // or throw new Error('Invalid status');
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

export function toMinutes(value: string | null | undefined): number {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) {
    return 0;
  }

  const [h, m] = value.split(':').map(Number);

  if (isNaN(h) || isNaN(m)) return 0;

  return h * 60 + m;
}
