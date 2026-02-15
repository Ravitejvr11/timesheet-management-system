using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Timesheet.Application.Projects.DTO;
using Timesheet.Application.Projects.Interfaces;
using Timesheet.Domain.Entities;
using Timesheet.Domain.Enums;
using Timesheet.Infrastructure.Persistence;

namespace Timesheet.Infrastructure.Services.Project;

public class ProjectService(AppDbContext context, IMapper mapper) : IProjectService
{
    public async Task<List<ProjectDto>> GetProjectsForEmployeeAsync(Guid employeeId)
    {
        return await context.EmployeeProjects
            .Where(ep => ep.EmployeeId == employeeId && ep.Project.Status == ProjectStatus.Active)
            .Include(ep => ep.Project)
            .Select(ep => new ProjectDto
            {
                Id = ep.Project.Id,
                Name = ep.Project.Name,
                Code = ep.Project.Code,
                ClientName = ep.Project.ClientName,
                IsBillable = ep.Project.IsBillable
            })
            .ToListAsync();
    }

    public async Task CreateProject(ProjectDto dto)
    {
        var project = mapper.Map<Domain.Entities.Project>(dto);

        // Map employees
        project.EmployeeProjects = dto.EmployeeIds
            .Select(empId => new EmployeeProject
            {
                EmployeeId = empId
            })
            .ToList();


        await context.Projects.AddAsync(project);
        await context.SaveChangesAsync();
    }

    public async Task UpdateProject(ProjectDto dto)
    {
        if (!dto.Id.HasValue)
            throw new ArgumentException("Project Id is required for update");

        var project = await context.Projects
                                    .Include(p => p.EmployeeProjects)
                                    .FirstOrDefaultAsync(p => p.Id == dto.Id.Value);

        if (project == null)
            throw new Exception("Project not found");

        mapper.Map(dto, project);

        var existingEmployeeIds = project.EmployeeProjects
            .Select(ep => ep.EmployeeId)
            .ToList();

        // Employees to add
        var toAdd = dto.EmployeeIds
            .Except(existingEmployeeIds)
            .ToList();

        // Employees to remove
        var toRemove = existingEmployeeIds
            .Except(dto.EmployeeIds)
            .ToList();

        // Remove
        project.EmployeeProjects = project.EmployeeProjects
            .Where(ep => !toRemove.Contains(ep.EmployeeId))
            .ToList();

        // Add
        foreach (var empId in toAdd)
        {
            project.EmployeeProjects.Add(new EmployeeProject
            {
                EmployeeId = empId,
                ProjectId = project.Id
            });
        }

        await context.SaveChangesAsync();
    }

    public async Task Deactivate(int projectId)
    {
        var project = await context.Projects.FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null)
            throw new Exception("Project not found");

        project.Status = ProjectStatus.Inactive;

        await context.SaveChangesAsync();
    }

    public async Task Activate(int projectId)
    {
        var project = await context.Projects.FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null)
            throw new Exception("Project not found");

        project.Status = ProjectStatus.Active;

        await context.SaveChangesAsync();
    }

    public async Task Delete(int projectId)
    {
        var project = await context.Projects.FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null)
            throw new Exception("Project not found");

        project.Status = ProjectStatus.Deleted;

        await context.SaveChangesAsync();
    }
}
