using Timesheet.Domain.Entities;
using Timesheet.Domain.Enums;
using Timesheet.Infrastructure.Persistence;

namespace Timesheet.Infrastructure.Persistence.Seed;

public static class ProjectSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (context.Projects.Any())
            return;

        var projects = new List<Project>
        {
            new()
            {
                Name = "ERP System",
                Code = "ERP001",
                Status = ProjectStatus.Active,
                ClientName = "ABC Corp",
                IsBillable = true,
                Description = "Enterprise Resource Planning System"
            },
            new()
            {
                Name = "Mobile Banking App",
                Code = "MBA002",
                Status = ProjectStatus.Active,
                ClientName = "XYZ Bank",
                IsBillable = true,
                Description = "Banking mobile application"
            },
            new()
            {
                Name = "Internal HR Portal",
                Code = "HRP003",
                Status = ProjectStatus.OnHold,
                ClientName = "Internal",
                IsBillable = false,
                Description = "HR management portal"
            }
        };

        context.Projects.AddRange(projects);

        await context.SaveChangesAsync();
    }
}
