using Microsoft.EntityFrameworkCore;

namespace Timesheet.Infrastructure.Persistence.Seed;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.MigrateAsync();

        await UserSeeder.SeedAsync(context);
        await RelationSeeder.SeedAsync(context);
    }
}
