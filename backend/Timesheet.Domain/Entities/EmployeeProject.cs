namespace Timesheet.Domain.Entities;

public class EmployeeProject
{
    public int Id { get; set; } // Auto-increment

    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public Guid EmployeeId { get; set; }
    public User Employee { get; set; } = null!;
}
