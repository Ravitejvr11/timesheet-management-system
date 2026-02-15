namespace Timesheet.Application.Timesheets.DTO;

public class UpdateTimesheetRequest
{
    public DateOnly WeekStartDate { get; set; }
    public DateOnly WeekEndDate { get; set; }
    public List<UpsertTimesheetEntryRequest>? Entries { get; set; }
}

public class UpsertTimesheetEntryRequest
{
    public DateOnly WorkDate { get; set; }
    public decimal BillableHours { get; set; }
    public decimal NonBillableHours { get; set; }
    public string? Description { get; set; }
}