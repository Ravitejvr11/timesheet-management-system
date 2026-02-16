using Microsoft.EntityFrameworkCore;
using Timesheet.Domain.Entities;
using Timesheet.Domain.Enums;

namespace Timesheet.Infrastructure.Persistence.Seed;

public static class RelationSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.EmployeeManagers.AnyAsync())
            return;

        var manager1 = await context.Users
            .FirstOrDefaultAsync(u => u.UserName == "Ravi");

        var manager2 = await context.Users
            .FirstOrDefaultAsync(u => u.UserName == "Tej");

        if (manager1 == null || manager2 == null)
            return;

        var employees = await context.Users
            .Where(u => u.Role == UserRole.Employee)
            .OrderBy(u => u.UserName)
            .ToListAsync();

        if (employees.Count < 5)
            return;

        var relations = new List<EmployeeManager>
        {
            // Ravi → first 3 employees
            new() { EmployeeId = employees[0].Id, ManagerId = manager1.Id },
            new() { EmployeeId = employees[1].Id, ManagerId = manager1.Id },
            new() { EmployeeId = employees[2].Id, ManagerId = manager1.Id },

            // Tej → remaining 2 employees
            new() { EmployeeId = employees[3].Id, ManagerId = manager2.Id },
            new() { EmployeeId = employees[4].Id, ManagerId = manager2.Id }
        };

        context.EmployeeManagers.AddRange(relations);

        await context.SaveChangesAsync();
    }
}
