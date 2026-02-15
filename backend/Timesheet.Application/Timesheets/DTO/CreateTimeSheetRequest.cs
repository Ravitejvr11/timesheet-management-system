namespace Timesheet.Application.Timesheets.DTO;

public class CreateTimesheetRequest
{
    public int ProjectId { get; set; }
    public DateOnly WeekStartDate { get; set; }
    public DateOnly WeekEndDate { get; set; }
}

