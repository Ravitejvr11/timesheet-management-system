using Timesheet.Domain.Enums;

namespace Timesheet.Application.Timesheets.DTO;

public record ManagerTimesheetDto(
    int Id,
    int ProjectId,
    string ProjectName,
    string ProjectCode,
    string ClientName,
    Guid EmployeeId,
    string EmployeeName,
    DateOnly WeekStartDate,
    DateOnly WeekEndDate,
    decimal TotalBillableHours,
    decimal TotalNonBillableHours,
    TimesheetStatus Status,
    string? Comments,
    List<TimesheetEntryDto> Entries
);
