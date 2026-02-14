namespace Timesheet.Domain.Entities;

public class TimesheetEntry
{
    public int Id { get; set; }

    public int TimesheetId { get; set; }
    public Timesheet Timesheet { get; set; } = null!;

    public DateOnly WorkDate { get; set; }

    public decimal BillableHours { get; set; }

    public decimal NonBillableHours { get; set; }

    public string? Description { get; set; }
}
