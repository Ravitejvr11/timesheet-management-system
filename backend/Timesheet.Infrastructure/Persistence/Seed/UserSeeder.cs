using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Timesheet.Domain.Entities;
using Timesheet.Domain.Enums;

namespace Timesheet.Infrastructure.Persistence.Seed;

public static class UserSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (!await context.Users.AnyAsync(u => u.Role == UserRole.Manager))
        {
            var adminUser = new User
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), // because Guid.NewGuid() creates duplicates
                UserName = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = UserRole.Manager,
                IsActive = true
            };

            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
        }
    }
}
