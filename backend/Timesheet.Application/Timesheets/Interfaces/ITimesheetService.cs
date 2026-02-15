using Timesheet.Application.Reports;
using Timesheet.Application.Timesheets.DTO;

namespace Timesheet.Application.Timesheets.Interfaces;

public interface ITimesheetService
{
    Task<List<TimesheetDto>> GetTimesheetsForEmployeeAsync(Guid employeeId, int projectId);

    Task<TimesheetDto> CreateTimesheetAsync(Guid employeeId, CreateTimesheetRequest request);

    Task<TimesheetDto> UpdateTimesheetAsync(Guid employeeId, int timesheetId, UpdateTimesheetRequest request);

    Task SubmitTimesheetAsync(Guid employeeId, int timesheetId);

    Task ApproveTimesheetAsync(Guid managerId, int timesheetId);

    Task RejectTimesheetAsync(Guid managerId, int timesheetId, string comments);

    Task<ProjectHoursSummary> GetProjectWiseHoursSummary(TimeReportFilter filter);
}
