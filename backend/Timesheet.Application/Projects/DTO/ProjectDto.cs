using Timesheet.Domain.Enums;

namespace Timesheet.Application.Projects.DTO;

//public record ProjectDto(
//    int Id,
//    string Name,
//    string Code,
//    string ClientName,
//    bool IsBillable
//);


public class ProjectDto
{
    public int? Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Code { get; set; } = string.Empty;

    public ProjectStatus Status { get; set; }

    public string ClientName { get; set; } = string.Empty;

    public bool IsBillable { get; set; }

    public string? Description { get; set; }

    public List<Guid> EmployeeIds { get; set; } = new();
}

