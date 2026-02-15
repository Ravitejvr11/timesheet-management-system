namespace Timesheet.Application.Reports;
public class EmployeeWiseHoursFilter
{
    public DateOnly FromDate { get; set; }
    public DateOnly ToDate { get; set; }

    public List<Guid> EmployeeIds { get; set; } = new();
}

