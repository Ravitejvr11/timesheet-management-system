using Timesheet.Application.Projects.DTO;

namespace Timesheet.Application.Projects.Interfaces;

public interface IProjectService
{
    Task<List<ProjectDto>> GetProjectsForEmployeeAsync(Guid employeeId);
}
