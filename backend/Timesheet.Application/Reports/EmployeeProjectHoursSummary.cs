public class EmployeeProjectHoursSummary
{
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; }

    public int ProjectId { get; set; }
    public string ProjectName { get; set; }

    public decimal BillableHours { get; set; }
    public decimal NonBillableHours { get; set; }

    public decimal TotalHours { get; set; }
}
