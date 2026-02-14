namespace Timesheet.Application.Timesheets.DTO;

public record CreateTimesheetRequest(
    int ProjectId,
    DateOnly WeekStartDate,
    DateOnly WeekEndDate
);
