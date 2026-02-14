using Microsoft.EntityFrameworkCore;
using Timesheet.Application.Projects.DTO;
using Timesheet.Application.Projects.Interfaces;
using Timesheet.Infrastructure.Persistence;

namespace Timesheet.Infrastructure.Services.Project;

public class ProjectService(AppDbContext context) : IProjectService
{
    public async Task<List<ProjectDto>> GetProjectsForEmployeeAsync(Guid employeeId)
    {
        return await context.EmployeeProjects
            .Where(ep => ep.EmployeeId == employeeId)
            .Include(ep => ep.Project)
            .Select(ep => new ProjectDto(
                ep.Project.Id,
                ep.Project.Name,
                ep.Project.Code,
                ep.Project.ClientName,
                ep.Project.IsBillable
            ))
            .ToListAsync();
    }
}
