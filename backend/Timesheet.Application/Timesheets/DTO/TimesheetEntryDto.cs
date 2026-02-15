namespace Timesheet.Application.Timesheets.DTO;

public record TimesheetEntryDto(
    int Id,
    DateOnly WorkDate,
    decimal BillableHours,
    decimal NonBillableHours,
    string? Description
);
