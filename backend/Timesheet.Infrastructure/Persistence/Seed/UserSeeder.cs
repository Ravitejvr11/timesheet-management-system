using Microsoft.EntityFrameworkCore;
using Timesheet.Domain.Entities;
using Timesheet.Domain.Enums;

namespace Timesheet.Infrastructure.Persistence.Seed;

public static class UserSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Users.AnyAsync())
            return;

        var manager1 = new User
        {
            Id = Guid.NewGuid(),
            UserName = "Ravi",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager1@123"),
            Role = UserRole.Manager,
            IsActive = true
        };

        var manager2 = new User
        {
            Id = Guid.NewGuid(),
            UserName = "Tej",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager2@123"),
            Role = UserRole.Manager,
            IsActive = true
        };

        var employees = new List<User>
        {
            new()
            {
                Id = Guid.NewGuid(),
                UserName = "John",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password@123"),
                Role = UserRole.Employee,
                IsActive = true
            },
            new()
            {
                Id = Guid.NewGuid(),
                UserName = "Arya",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password@123"),
                Role = UserRole.Employee,
                IsActive = true
            },
            new()
            {
                Id = Guid.NewGuid(),
                UserName = "Tony",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password@123"),
                Role = UserRole.Employee,
                IsActive = true
            },
            new()
            {
                Id = Guid.NewGuid(),
                UserName = "Jamie",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password@123"),
                Role = UserRole.Employee,
                IsActive = true
            },
            new()
            {
                Id = Guid.NewGuid(),
                UserName = "Bruce",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password@123"),
                Role = UserRole.Employee,
                IsActive = true
            }
        };

        context.Users.AddRange(manager1, manager2);
        context.Users.AddRange(employees);

        await context.SaveChangesAsync();
    }
}
