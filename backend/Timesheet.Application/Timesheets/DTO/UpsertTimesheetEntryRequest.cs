namespace Timesheet.Application.Timesheets.DTO;

public record UpsertTimesheetEntryRequest(
    DateOnly WorkDate,
    decimal BillableHours,
    decimal NonBillableHours,
    string? Description
);
