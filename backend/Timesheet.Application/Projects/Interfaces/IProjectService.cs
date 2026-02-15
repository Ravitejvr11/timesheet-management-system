using Timesheet.Application.Projects.DTO;

namespace Timesheet.Application.Projects.Interfaces;

public interface IProjectService
{
    Task<List<ProjectDto>> GetProjectsForEmployeeAsync(Guid employeeId);

    Task CreateProject(ProjectDto dto);

    Task UpdateProject(ProjectDto dto);

    Task Deactivate(int projectId);

    Task Activate(int projectId);

    Task Delete(int projectId);
    Task<List<ProjectDto>> GetAllProjectsAsync();
    Task<List<ManagerEmployeeDto>> GetEmployeesForManagerAsync(Guid managerId);
    Task<List<ManagerEmployeeDto>> GetEmployeesByProjectAsync(int projectId);

}
