using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Timesheet.Domain.Entities;
using Timesheet.Domain.Enums;

namespace Timesheet.Infrastructure.Persistence.Seed;

public static class UserSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Users.AnyAsync(u => u.UserName == "Ravi"))
            return;

        var passwordHash = BCrypt.Net.BCrypt.HashPassword("Password@123");

        var manager1 = new User
        {
            Id = Guid.NewGuid(),
            UserName = "Ravi",
            PasswordHash = passwordHash,
            Role = UserRole.Manager,
            IsActive = true
        };

        var manager2 = new User
        {
            Id = Guid.NewGuid(),
            UserName = "Tej",
            PasswordHash = passwordHash,
            Role = UserRole.Manager,
            IsActive = true
        };

        var employees = new List<User>
    {
        new()
        {
            Id = Guid.NewGuid(),
            UserName = "John snow",
            PasswordHash = passwordHash,
            Role = UserRole.Employee,
            IsActive = true
        },
        new()
        {
            Id = Guid.NewGuid(),
            UserName = "Arya stark",
            PasswordHash = passwordHash,
            Role = UserRole.Employee,
            IsActive = true
        },
        new()
        {
            Id = Guid.NewGuid(),
            UserName = "Tony stark",
            PasswordHash = passwordHash,
            Role = UserRole.Employee,
            IsActive = true
        },
        new()
        {
            Id = Guid.NewGuid(),
            UserName = "Jamie",
            PasswordHash = passwordHash,
            Role = UserRole.Employee,
            IsActive = true
        }
    };

        context.Users.AddRange(manager1, manager2);
        context.Users.AddRange(employees);

        await context.SaveChangesAsync();
    }

}
