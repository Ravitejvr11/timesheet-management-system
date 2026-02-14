namespace Timesheet.Domain.Entities;

public class EmployeeManager
{
    public int Id { get; set; } // Auto-increment

    public Guid EmployeeId { get; set; }
    public User Employee { get; set; } = null!;

    public Guid ManagerId { get; set; }
    public User Manager { get; set; } = null!;
}
