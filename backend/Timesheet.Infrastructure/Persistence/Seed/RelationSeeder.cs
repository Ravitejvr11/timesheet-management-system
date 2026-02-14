using Microsoft.EntityFrameworkCore;
using Timesheet.Domain.Entities;
using Timesheet.Domain.Enums;
using Timesheet.Infrastructure.Persistence;

namespace Timesheet.Infrastructure.Persistence.Seed;

public static class RelationSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (context.EmployeeManagers.Any() || context.EmployeeProjects.Any())
            return;

        var manager = await context.Users
            .FirstOrDefaultAsync(u => u.UserName == "Ravi");

        if (manager == null)
            return;

        var employees = await context.Users
            .Where(u => u.Role == UserRole.Employee)
            .ToListAsync();

        var projects = await context.Projects.ToListAsync();

        if (!employees.Any() || !projects.Any())
            return;

        // Employee → Manager mapping
        var employeeManagers = employees.Select(e => new EmployeeManager
        {
            EmployeeId = e.Id,
            ManagerId = manager.Id
        }).ToList();

        context.EmployeeManagers.AddRange(employeeManagers);

        // Assign employees to projects
        var employeeProjects = new List<EmployeeProject>();

        foreach (var employee in employees)
        {
            foreach (var project in projects)
            {
                employeeProjects.Add(new EmployeeProject
                {
                    EmployeeId = employee.Id,
                    ProjectId = project.Id
                });
            }
        }

        context.EmployeeProjects.AddRange(employeeProjects);

        await context.SaveChangesAsync();
    }
}
