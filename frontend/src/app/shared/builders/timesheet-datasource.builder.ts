import type { Project } from "@core/models/project/project.model";
import type { TimesheetRow } from "@core/models/timesheet/timesheet-row.model";
import type { TimesheetViewModel } from "@core/models/timesheet/timesheetViewModel";


export function buildTimesheetDataSource(
  timesheets: TimesheetViewModel[],
  projects: Project[],
): TimesheetRow[] {
  const projectMap = new Map<number, Project>();

  projects.forEach((project) => {
    projectMap.set(project.id, project);
  });

  return timesheets.map((t) => {
    const project = projectMap.get(t.projectId);

    return {
      id: t.id,

      projectCode: project?.code ?? '-',
      projectName: project?.name ?? '-',

      weekStartDate: t.weekStartDate,
      weekEndDate: t.weekEndDate,

      status: t.status,

      submittedAt: t.submittedAt ?? null,
      approvedAt: t.approvedAt ?? null,

      totalBillableHours: t.totalBillableHours,
      totalNonBillableHours: t.totalNonBillableHours,
      totalHours:
        t.totalBillableHours + t.totalNonBillableHours,
    };
  });
}
