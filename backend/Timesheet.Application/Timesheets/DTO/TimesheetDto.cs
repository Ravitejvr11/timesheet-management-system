using Timesheet.Domain.Enums;

namespace Timesheet.Application.Timesheets.DTO;

public record TimesheetDto(
    int Id,
    int ProjectId,
    DateOnly WeekStartDate,
    DateOnly WeekEndDate,
    decimal TotalBillableHours,
    decimal TotalNonBillableHours,
    TimesheetStatus Status,
    string? Comments,
    List<TimesheetEntryDto> Entries
);
