using Timesheet.Domain.Enums;

namespace Timesheet.Application.Timesheets.DTO;

public class TimesheetDto
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public Guid EmployeeId { get; set; }
    public DateOnly WeekStartDate { get; set; }
    public DateOnly WeekEndDate { get; set; }
    public decimal TotalBillableHours { get; set; }
    public decimal TotalNonBillableHours { get; set; }
    public TimesheetStatus Status { get; set; }
    public string? Comments { get; set; }
    public List<TimesheetEntryDto> Entries { get; set; } = new List<TimesheetEntryDto>();

}
