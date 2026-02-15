namespace Timesheet.Application.Timesheets.DTO;

public class TimesheetEntryDto
{
    public int Id { get; set; }
    public DateOnly WorkDate { get; set; }
    public decimal BillableHours { get; set; }
    public decimal NonBillableHours { get; set; }
    public string? Description { get; set; }
}

