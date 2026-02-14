namespace Timesheet.Application.Projects.DTO;

public record ProjectDto(
    int Id,
    string Name,
    string Code,
    string ClientName,
    bool IsBillable
);
