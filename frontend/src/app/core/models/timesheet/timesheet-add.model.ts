export interface AddTimesheetPayload {
  id?: number,
  projectId: number;
  weekFrom: string;
  weekTo: string;
}
