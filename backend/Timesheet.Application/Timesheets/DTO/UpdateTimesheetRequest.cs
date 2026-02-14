namespace Timesheet.Application.Timesheets.DTO;

public record UpdateTimesheetRequest(
    DateOnly WeekStartDate,
    DateOnly WeekEndDate,
    List<UpsertTimesheetEntryRequest>? Entries
);
