namespace Timesheet.Application.Reports;
public class TimeReportFilter
{
    public DateOnly FromDate { get; set; }
    public DateOnly ToDate { get; set; }

    public List<Guid> EmployeeIds { get; set; } = new();

    public List<int> ProjectIds { get; set; } = new();
}

