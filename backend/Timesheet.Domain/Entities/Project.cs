using Timesheet.Domain.Enums;

namespace Timesheet.Domain.Entities;

public class Project
{
    public int Id { get; set; } // Auto-increment

    public string Name { get; set; } = string.Empty;

    public string Code { get; set; } = string.Empty;

    public ProjectStatus Status { get; set; }

    public string ClientName { get; set; } = string.Empty;

    public bool IsBillable { get; set; }

    public string? Description { get; set; }

    // Navigation
    public ICollection<EmployeeProject> EmployeeProjects { get; set; } = new List<EmployeeProject>();
}
