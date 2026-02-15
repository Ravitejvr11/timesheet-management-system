namespace Timesheet.Application.Reports;

public class ProjectHoursSummary
{
    public decimal TotalBillableHours { get; set; }
    public decimal TotalNonBillableHours { get; set; }

    public decimal TotalHours => TotalBillableHours + TotalNonBillableHours;

    public List<ProjectBillableDto> Projects { get; set; } = new();
}

public class ProjectBillableDto
{
    public int ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;

    public decimal BillableHours { get; set; }
    public decimal NonBillableHours { get; set; }

    public decimal TotalHours => BillableHours + NonBillableHours;

    public List<EmployeeBillableDto> Employees { get; set; } = new();
}


public class EmployeeBillableDto
{
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;

    public decimal BillableHours { get; set; }
    public decimal NonBillableHours { get; set; }

    public decimal TotalHours => BillableHours + NonBillableHours;
}
