using Timesheet.Domain.Enums;

namespace Timesheet.Domain.Entities;

public class Timesheet
{
    public int Id { get; set; }

    public Guid EmployeeId { get; set; }
    public User Employee { get; set; } = null!;

    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public DateOnly WeekStartDate { get; set; }
    public DateOnly WeekEndDate { get; set; }

    public decimal TotalBillableHours { get; set; }
    public decimal TotalNonBillableHours { get; set; }

    public TimesheetStatus Status { get; set; }

    public string? Comments { get; set; }

    public DateTime? SubmittedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }

    public Guid? ApprovedBy { get; set; }
    public User? ApprovedByUser { get; set; }

    public ICollection<TimesheetEntry> Entries { get; set; } = new List<TimesheetEntry>();
}
